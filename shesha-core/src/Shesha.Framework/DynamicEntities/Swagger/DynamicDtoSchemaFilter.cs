using Abp.Domain.Entities.Auditing;
using Abp.Threading;
using Microsoft.OpenApi.Models;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shesha.DynamicEntities.Swagger
{
    public class DynamicDtoSchemaFilter : ISchemaFilter
    {

        private readonly IEntityConfigCache _entityConfigCache;
            
        public DynamicDtoSchemaFilter(
            IEntityConfigCache entityConfigCache
        ) 
        {
            _entityConfigCache = entityConfigCache;
        }

        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            var isProxy = typeof(IDynamicDtoProxy).IsAssignableFrom(context.Type);
            var isGeneric = context.Type.IsGenericType;

            if (!context.Type.IsDynamicDto() || isProxy)
                return;

            var modelType = isGeneric 
                ? context.Type 
                : context.Type.FindBaseGenericType(typeof(DynamicDto<,>)).NotNull();

            var isCreateDto = modelType.GetGenericTypeDefinition().IsAssignableTo(typeof(CreateDynamicDto<,>));
            var isUpdateDto = modelType.GetGenericTypeDefinition().IsAssignableTo(typeof(UpdateDynamicDto<,>));

            var srcType = modelType.GetGenericArguments()[0];
            var srcProperties = srcType?.GetProperties().ToList();
            var entityReferenceProperties = srcProperties?.Where(x => x.PropertyType.IsEntityType()).Select(x => x.Name).ToList();

            var propertiesConfigs = srcType != null 
                ? AsyncHelper.RunSync(async () => await _entityConfigCache.GetEntityPropertiesAsync(srcType))
                : null;

            var dtoBuilder = StaticContext.IocManager.Resolve<IDynamicDtoTypeBuilder>();
            var builderContext = new DynamicDtoTypeBuildingContext
            {
                ModelType = modelType
            };
            var dtoType = AsyncHelper.RunSync(async () => await dtoBuilder.BuildDtoFullProxyTypeAsync(builderContext.ModelType, builderContext));

            // build list of properties for case-insensitive search
            var propNames = schema.Properties.Select(p => p.Key.ToLower()).ToList();

            context.SchemaGenerator.GenerateSchema(dtoType, context.SchemaRepository);

            var allProperties = dtoType.GetProperties();
            foreach (var property in allProperties)
            {
                var propertyName = property.Name;
                var srcProperty = srcProperties?.FirstOrDefault(x => x.Name == propertyName);
                
                if (
                    // skip already added
                    propNames.Contains(propertyName.ToLower())
                    || (isCreateDto || isUpdateDto)
                        && // skip special properties
                        (propertyName != nameof(FullAuditedEntity.Id) && propertyName.IsSpecialProperty()
                        || // skip system Readonly attributes
                        srcProperty?.GetAttributeOrNull<ReadOnlyAttribute>(true) != null
                        || // skip EntityConfig Reaadonly
                        (propertiesConfigs?.FirstOrDefault(x => x.Name == propertyName)?.ReadOnly ?? false)
                        || !(srcProperty?.CanWrite ?? true)
                    )
                    || // skip Shesha Readonly attributes
                    isCreateDto && !(srcProperty?.GetAttributeOrNull<ReadonlyPropertyAttribute>(true)?.Insert ?? true)
                    || // skip Shesha Readonly attributes
                    isUpdateDto && !(srcProperty?.GetAttributeOrNull<ReadonlyPropertyAttribute>(true)?.Update ?? true)
                )
                    continue;

                var propertySchema = context.SchemaGenerator.GenerateSchema(property.PropertyType, context.SchemaRepository, memberInfo: property);

                if (entityReferenceProperties?.Contains(property.Name) ?? false)
                {
                    var anyOf = new List<OpenApiSchema>()
                    {
                        propertySchema,
                        context.SchemaGenerator.GenerateSchema(typeof(GenericEntityReference), context.SchemaRepository, memberInfo: property)
                    };
                    propertySchema = new OpenApiSchema();
                    propertySchema.AnyOf = anyOf;
                }

                // note: Nullable is not processed by GenerateSchema
                propertySchema.Nullable = property.PropertyType.IsNullableType();
              
                if(!schema.Properties.Keys.Contains(property.Name.ToCamelCase()))
                    schema.Properties.Add(property.Name.ToCamelCase(), propertySchema);
    
            }

            if (schema.Properties.ContainsKey(nameof(IHasJObjectField._jObject).ToCamelCase()))
            {
                // Hide JObject field for DynamicDto
                schema.Properties.Remove(nameof(IHasJObjectField._jObject).ToCamelCase());
            }

            // add `_formFields` with comment
            var formFieldsProp = typeof(IHasFormFieldsList).GetRequiredProperty(nameof(IHasFormFieldsList._formFields));
            if (!propNames.Contains(formFieldsProp.Name.ToLower()))
            {
                var formFieldsSchema = context.SchemaGenerator.GenerateSchema(formFieldsProp.PropertyType, context.SchemaRepository, memberInfo: formFieldsProp);
                schema.Properties.Add(formFieldsProp.Name, formFieldsSchema);
            }
        }
    }
}
