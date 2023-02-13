using Abp.Application.Services.Dto;
using Microsoft.OpenApi.Models;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.GraphQL.Mvc;
using Shesha.Reflection;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Linq;

namespace Shesha.GraphQL.Swagger
{
    /// <summary>
    /// Generates proper schema for the <see cref="GraphQLDataResult"/>
    /// </summary>
    public class GraphQLSchemaFilter : ISchemaFilter
    {
        private readonly IDynamicDtoTypeBuilder _dynamicDtoTypeBuilder;        

        public GraphQLSchemaFilter(IDynamicDtoTypeBuilder dynamicDtoTypeBuilder)
        {
            _dynamicDtoTypeBuilder = dynamicDtoTypeBuilder;
        }

        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (!typeof(GraphQLDataResult).IsAssignableFrom(context.Type))
                return;

            if (!context.Type.IsSubtypeOfGeneric(typeof(GraphQLDataResult<>)))
                return;

            var genericArg = context.Type.GetGenericArguments().FirstOrDefault();

            var isPagedResult = genericArg.IsSubtypeOfGeneric(typeof(PagedResultDto<>));

            var entityType = isPagedResult
                ? genericArg.GetGenericArguments().FirstOrDefault()
                : genericArg;

            if (!entityType.IsEntityType())
                return;

            schema.Properties.Clear();

            if (isPagedResult) 
            {
                var entityDtoType = GetDtoType(entityType);
                var pagedResultType = typeof(PagedResultDto<>).MakeGenericType(entityDtoType);
                    
                var pagedResultProps = pagedResultType.GetProperties();
                foreach (var property in pagedResultProps)
                {
                    var propertySchema = context.SchemaGenerator.GenerateSchema(property.PropertyType, context.SchemaRepository, memberInfo: property);
                    schema.Properties.Add(property.Name.ToCamelCase(), propertySchema);
                }
                schema.Description = "NOTE: shape of the response depends on the `properties` argument";
            } else 
                FillEntitySchema(schema, context, entityType);
        }

        private Type GetDtoType(Type entityType) 
        {
            var idType = entityType.GetEntityIdType();
            var dtoBaseType = typeof(DynamicDto<,>).MakeGenericType(entityType, idType);

            var builderContext = new DynamicDtoTypeBuildingContext
            {
                ModelType = dtoBaseType
            };
            var dtoType = AsyncHelper.RunSync(async () => await _dynamicDtoTypeBuilder.BuildDtoFullProxyTypeAsync(dtoBaseType, builderContext));
            
            return dtoType;
        }

        private void FillEntitySchema(OpenApiSchema schema, SchemaFilterContext context, Type entityType) 
        {
            var dtoType = GetDtoType(entityType);

            // build list of properties for case-insensitive search
            var propNames = schema.Properties.Select(p => p.Key.ToLower()).ToList();

            context.SchemaGenerator.GenerateSchema(dtoType, context.SchemaRepository);

            var allProperties = dtoType.GetProperties();
            foreach (var property in allProperties)
            {
                if (propNames.Contains(property.Name.ToLower()))
                    continue;

                var propertySchema = context.SchemaGenerator.GenerateSchema(property.PropertyType, context.SchemaRepository, memberInfo: property);

                // note: Nullable is not processed by GenerateSchema
                propertySchema.Nullable = property.PropertyType.IsNullableType();

                schema.Properties.Add(property.Name.ToCamelCase(), propertySchema);
            }
        }
    }
}