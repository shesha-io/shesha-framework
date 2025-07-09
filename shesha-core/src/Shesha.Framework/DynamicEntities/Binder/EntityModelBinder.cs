using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.DelayedUpdate;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.JsonEntities.Proxy;
using Shesha.JsonLogic;
using Shesha.Metadata;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Binder
{
    public class EntityModelBinder : IEntityModelBinder, ITransientDependency
    {
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IHardcodeMetadataProvider _metadataProvider;
        private readonly IIocManager _iocManager;
        private readonly ITypeFinder _typeFinder;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IObjectValidatorManager _objectValidatorManager;
        private readonly IModelConfigurationManager _modelConfigurationManager;

        public EntityModelBinder(
            IDynamicRepository dynamicRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IHardcodeMetadataProvider metadataProvider,
            IIocManager iocManager,
            ITypeFinder typeFinder,
            IEntityConfigurationStore entityConfigurationStore,
            IObjectValidatorManager propertyValidatorManager,
            ModelConfigurationManager modelConfigurationManager
            )
        {
            _dynamicRepository = dynamicRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _metadataProvider = metadataProvider;
            _iocManager = iocManager;
            _typeFinder = typeFinder;
            _entityConfigurationStore = entityConfigurationStore;
            _objectValidatorManager = propertyValidatorManager;
            _modelConfigurationManager = modelConfigurationManager;
        }

        private List<JProperty> ExcludeFrameworkFields(List<JProperty> query)
        {
            return query.Where(x =>
            x.Name.ToLower() != nameof(IEntity.Id).ToLower()
            && x.Name != nameof(IHasFormFieldsList._formFields)
            && x.Name != nameof(IHasJObjectField._jObject).ToCamelCase()
            && x.Name != nameof(IHasClassNameField._className)
            && x.Name != nameof(IHasDisplayNameField._displayName)
            && x.Name != nameof(IHasDelayedUpdateField._delayedUpdate)
            ).ToList();
        }

        private bool IsFrameworkFields(JProperty prop)
        {
            return prop.Name.ToLower() == nameof(IEntity.Id).ToLower()
                || prop.Name == nameof(IHasFormFieldsList._formFields)
                || prop.Name == nameof(IHasJObjectField._jObject).ToCamelCase()
                || prop.Name == nameof(IHasClassNameField._className)
                || prop.Name == nameof(IHasDisplayNameField._displayName)
                || prop.Name == nameof(IHasDelayedUpdateField._delayedUpdate)
                || prop.Name.StartsWith("_&@#GH0ST") // for backward compatiblity
            ;
        }

        private List<string> GetFormFields(JObject jobject, List<string>? formFields = null)
        {
            if (formFields != null)
                return formFields;
            
            var _formFields = jobject.Property(nameof(IHasFormFieldsList._formFields));
            var formFieldsArray = _formFields?.Value as JArray;
            return formFieldsArray?.Select(f => f.Value<string>()).WhereNotNull().ToList() ?? new List<string>();
        }

        [UnitOfWork]
        public async Task<bool> BindPropertiesAsync(JObject jobject, object entity, EntityModelBindingContext context,
            string? propertyName = null, List<string>? formFields = null)
        {
            var entityType = entity.GetType().StripCastleProxyType();

            var properties = entityType.GetProperties().ToList();
            var entityIdValue = entity.GetType().GetProperty("Id")?.GetValue(entity)?.ToString();
            if (!string.IsNullOrWhiteSpace(entityIdValue) && entityIdValue != Guid.Empty.ToString())
                properties = properties.Where(p => p.Name != "Id").ToList();

            var config = await _modelConfigurationManager.GetModelConfigurationAsync(entityType.Namespace, entityType.Name);

            context.LocalValidationResult = new List<ValidationResult>();

            var formFieldsInternal = GetFormFields(jobject, formFields);
            formFieldsInternal = formFieldsInternal.Select(x => x.ToCamelCase()).ToList();

            var jProps = jobject.Properties().ToList();

            // properties that were added to the _formFields list but not presented in the json should be reset to Null
            var missedFormFields = formFieldsInternal.Select(x => { var parts = x.Split("."); return parts[0]; })
                .Where(x => !jProps.Any(p => p.Name == x)).ToList();
            foreach (var mprop in missedFormFields)
            {
                var property = properties.FirstOrDefault(x => !x.IsReadOnly() && x.Name.ToCamelCase() == mprop);
                if (property != null)
                {
                    if (property.PropertyType.IsEntity())
                    {
                        var cascadeAttr = property.GetCustomAttribute<CascadeUpdateRulesAttribute>()
                            ?? property.PropertyType.GetCustomAttribute<CascadeUpdateRulesAttribute>();
                        var childEntity = property.GetValue(entity);
                        if (childEntity != null && (cascadeAttr?.DeleteUnreferenced ?? false))
                        {
                            await DeleteUnreferencedEntityAsync(childEntity, entity);
                        }
                    }
                    else
                        if (await ValidateAsync(entity, string.IsNullOrWhiteSpace(propertyName) ? mprop : $"{propertyName}.{mprop}", null, context))
                        property.SetValue(entity, null);
                }
            }

            foreach (var jproperty in jProps)
            {
                var jName = jproperty.Name.ToCamelCase();
                var jFullName = string.IsNullOrWhiteSpace(propertyName) ? jName : $"{propertyName}.{jName}";
                try
                {
                    // Skip property if _formFields is specified and doesn't contain propertyName
                    var fName = context.ArrayItemIndex != null
                        ? context.ArrayItemIndex?.ToString() + "." + jName
                        : jName;
                    if (formFieldsInternal.Any()
                        && !formFieldsInternal.Any(x => x.Equals(fName) || x.StartsWith(fName + ".") || x.Equals(jName) || x.StartsWith(jName + ".")))
                        continue;

                    var childFormFields = formFieldsInternal
                        .Where(x => x.Equals(fName) || x.StartsWith(fName + ".") || x.Equals(jName) || x.StartsWith(jName + "."))
                        .Select(x => x.RemovePrefix(fName).RemovePrefix("."))
                        .Where(x => !x.IsNullOrWhiteSpace())
                        .ToList();
                    childFormFields = childFormFields.Any() ? childFormFields : null;

                    var property = properties.FirstOrDefault(x => x.Name.ToCamelCase() == jName);
                    if (property == null && jName.EndsWith("Id"))
                    {
                        var idName = Utilities.StringHelper.Left(jName, jName.Length - 2);
                        property = properties.FirstOrDefault(x => x.Name.ToCamelCase() == idName.ToCamelCase());
                    }
                    if (property != null)
                    {
                        // skip Read only properties
                        if (property.IsReadOnly())
                            continue;

                        var propConfig = config.Properties.FirstOrDefault(x => x.Name.ToCamelCase() == jName);

                        if (jName != "id" && _metadataProvider.IsFrameworkRelatedProperty(property))
                            continue;

                        var propType = _metadataProvider.GetDataType(property);

                        var dbValue = property.GetValue(entity);
                        var isReadOnly = property.GetCustomAttribute<ReadonlyPropertyAttribute>() != null
                            || property.GetCustomAttribute<ReadOnlyAttribute>() != null;

                        var result = true;
                        if (jproperty.Value.IsNull())
                        {
                            if (property.PropertyType.IsEntity())
                            {
                                var cascadeAttr = property.GetCustomAttribute<CascadeUpdateRulesAttribute>()
                                    ?? property.PropertyType.GetCustomAttribute<CascadeUpdateRulesAttribute>();
                                
                                if (dbValue != null && (cascadeAttr?.DeleteUnreferenced ?? false))
                                {
                                    await DeleteUnreferencedEntityAsync(dbValue, entity);
                                }
                            }
                            else
                                if (await ValidateAsync(entity, jFullName, null, context))
                                property.SetValue(entity, null);
                        }
                        else
                        {
                            switch (propType.DataType)
                            {
                                case DataTypes.String:
                                case DataTypes.Number:
                                case DataTypes.Boolean:
                                case DataTypes.Guid:
                                case DataTypes.ReferenceListItem:
                                case DataTypes.Time: // ToDo: Review parsing of time
                                                     //case DataTypes.Enum: // Enum binded as integer
                                    object? parsedValue = null;
                                    result = Parser.TryParseToValueType(jproperty.Value.ToString(), property.PropertyType, out parsedValue, isDateOnly: propType.DataType == DataTypes.Date);
                                    if (result && dbValue?.ToString() != parsedValue?.ToString())
                                        if (await ValidateAsync(entity, jFullName, parsedValue, context))
                                            property.SetValue(entity, parsedValue);
                                    break;
                                case DataTypes.DateTime:
                                case DataTypes.Date:
                                    var value = jproperty.Value.To<DateTime>();
                                    value = propType.DataType == DataTypes.Date ? value.Date : value;
                                    if (dbValue?.ToString() != value.ToString())
                                        if (await ValidateAsync(entity, jFullName, value, context))
                                            property.SetValue(entity, value);
                                    break;
                                case DataTypes.Array:
                                    switch (propType.DataFormat)
                                    {
                                        case ArrayFormats.EntityReference:
                                        case ArrayFormats.Object:
                                        case ArrayFormats.ObjectReference:
                                        case ArrayFormats.String:
                                        case ArrayFormats.Number:
                                        case ArrayFormats.Boolean:
                                            if (property.PropertyType.IsGenericType && jproperty.Value is JArray jList)
                                            {
                                                var paramType = property.PropertyType.GetGenericArguments()[0];

                                                if (paramType.IsClass && !paramType.IsSystemType())
                                                {
                                                    var listType = JsonEntityProxy.GetUnproxiedType(property.PropertyType);
                                                    if (listType.IsAssignableTo(typeof(IEnumerable<>).MakeGenericType(paramType)))
                                                        listType = typeof(List<>).MakeGenericType(paramType);
                                                    else if (listType.IsAssignableTo(typeof(IList<>).MakeGenericType(paramType)))
                                                        listType = typeof(List<>).MakeGenericType(paramType);
                                                    else if (listType.IsAssignableTo(typeof(ICollection<>).MakeGenericType(paramType)))
                                                        listType = typeof(Collection<>).MakeGenericType(paramType);

                                                    var idProp = paramType.GetProperty("Id");
                                                    var addMethod = listType.GetMethod("Add");
                                                    var addDbMethod = dbValue?.GetType().GetMethod("Add");
                                                    var removeDbMethod = dbValue?.GetType().GetMethod("Remove");
                                                    var newArray = Activator.CreateInstance(listType);

                                                    // objects and entities
                                                    int arrayItemIndex = 0;
                                                    var r = true;
                                                    foreach (var item in jList)
                                                    {
                                                        context.ArrayItemIndex = arrayItemIndex++;
                                                        object? newItem = null;
                                                        if (!item.IsNullOrEmpty())
                                                        {
                                                            if (paramType.IsEntityType())
                                                            {
                                                                await PerformEntityReferenceAsync(entity, property, propConfig, item, "", null /*dbValue*/, childFormFields, context, value => newItem = value);
                                                                r = r & true;
                                                            }
                                                            else
                                                            {
                                                                newItem = await GetObjectOrObjectReferenceAsync(paramType, item.ForceCastAs<JObject>(), context, childFormFields);
                                                                r = newItem != null && await _objectValidatorManager.ValidateObjectAsync(newItem, context.LocalValidationResult) && r;
                                                            }
                                                            addMethod?.Invoke(newArray, [newItem]);
                                                        }
                                                    }
                                                    if (r)
                                                    {
                                                        if (paramType.IsEntityType() && dbValue != null && idProp != null && addDbMethod != null && removeDbMethod != null)
                                                        {
                                                            // Update existing array for the array of entities
                                                            if (newArray is IEnumerable<object> eArray && dbValue is IEnumerable<object> eDbArray)
                                                            {
                                                                var exsistIds = eDbArray.Select(x => new { id = idProp?.GetValue(x, null)?.ToString(), obj = x }).Distinct().ToList();
                                                                var newIds = eArray.Select(x => new { id = idProp?.GetValue(x, null)?.ToString(), obj = x }).Distinct().ToList();
                                                                var addItems = newIds.Where(x => !exsistIds.Any(z => z.id == x.id));
                                                                foreach (var item in addItems)
                                                                {
                                                                    addDbMethod?.Invoke(eDbArray, new[] { item.obj });
                                                                }
                                                                var removeItems = exsistIds.Where(x => !newIds.Any(z => z.id == x.id));
                                                                foreach (var item in removeItems)
                                                                {
                                                                    removeDbMethod?.Invoke(eDbArray, new[] { item.obj });
                                                                }
                                                            }
                                                        }
                                                        else
                                                        {
                                                            // Save new array for the array of objects
                                                            context.ArrayItemIndex = null;
                                                            property.SetValue(entity, newArray);
                                                        }

                                                    }
                                                }
                                                else
                                                {
                                                    var newObject = JsonConvert.DeserializeObject(jproperty.Value.ToString(), property.PropertyType);
                                                    property.SetValue(entity, newObject);
                                                }
                                            }
                                            break;
                                        case ArrayFormats.ReferenceListItem:
                                            string[] valComponents;
                                            if (jproperty.Value is JArray jArray)
                                            {
                                                valComponents = jArray.Select(x => x.ToString()).ToArray();
                                            }
                                            else
                                            {
                                                var propertyValue = jproperty.Value.ToString();
                                                // Removing the redundant ',' from the hidden element.
                                                if (propertyValue.EndsWith(",")) propertyValue = propertyValue.Substring(0, propertyValue.Length - 1);
                                                else if (propertyValue.StartsWith(",")) propertyValue = propertyValue.Substring(1, propertyValue.Length - 1);
                                                else propertyValue.Replace(",,", ",");
                                                valComponents = propertyValue.Split(',');
                                            }
                                            var totalVal = 0;
                                            for (int i = 0; i < valComponents.Length; i++)
                                            {
                                                if (!string.IsNullOrEmpty(valComponents[i]))
                                                {
                                                    int val;
                                                    if (!int.TryParse(valComponents[i], out val))
                                                    {
                                                        // Try parse enum
                                                        var prop = !string.IsNullOrWhiteSpace(propertyName)
                                                            ? entity.GetType().GetProperty(ExtractName(propertyName))
                                                            : null;
                                                        if (prop != null && prop.PropertyType.IsEnum)
                                                        {
                                                            var type = prop.PropertyType.GetUnderlyingTypeIfNullable();
                                                            object enumVal;
                                                            try
                                                            {
                                                                enumVal = Enum.Parse(type, valComponents[i], true);
                                                            }
                                                            catch (Exception)
                                                            {
                                                                context.LocalValidationResult.Add(new ValidationResult($"Value of '{jproperty.Path}' is not valid."));
                                                                break;
                                                            }
                                                            if (enumVal != null)
                                                            {
                                                                totalVal += (int)enumVal;
                                                            }
                                                        }
                                                    }
                                                    else
                                                        totalVal += val;
                                                }
                                            }
                                            object? refValue = null;
                                            result = Parser.TryParseToValueType(totalVal.ToString(), property.PropertyType, out refValue);
                                            if (result && (await ValidateAsync(entity, jFullName, refValue, context)))
                                                property.SetValue(entity, refValue);
                                            break;
                                    }
                                    break;
                                case DataTypes.Object:
                                case DataTypes.ObjectReference:
                                    if (isReadOnly)
                                        break;
                                    if (jproperty.Value is JObject jObject)
                                    {
                                        var r = true;
                                        var childObject = property.GetValue(entity);
                                        if (!jObject.IsNullOrEmpty())
                                        {
                                            if (childObject != null)
                                                r = await BindPropertiesAsync(jObject, childObject, context, null, childFormFields);
                                            else
                                            {
                                                childObject = await GetObjectOrObjectReferenceAsync(property.PropertyType, jObject as JObject, context, childFormFields);
                                                r = childObject != null;
                                            }
                                        }
                                        if (childObject == null || (await _objectValidatorManager.ValidateObjectAsync(childObject, context.LocalValidationResult)) && r)
                                            property.SetValue(entity, childObject);
                                    }
                                    else
                                    {
                                        property.SetValue(entity, null);
                                    }
                                    break;
                                case DataTypes.EntityReference:
                                    await PerformEntityReferenceAsync(entity, property, propConfig, jproperty.Value, jproperty.Path, dbValue, childFormFields, context, value => property.SetValue(entity, value));
                                    break;
                                default:
                                    break;
                            }

                            if (!result)
                            {
                                context.LocalValidationResult.Add(new ValidationResult($"Value of '{jproperty.Path}' is not valid."));
                            }
                        }
                    }
                    else
                    {
                        if (!IsFrameworkFields(jproperty))
                            context.LocalValidationResult.Add(new ValidationResult($"Property '{jproperty.Path}' not found for '{propertyName ?? entity.GetType().Name}'."));
                    }
                }
                catch (CascadeUpdateRuleException ex)
                {
                    context.LocalValidationResult.Add(new ValidationResult($"{ex.Message} for '{jproperty.Path}'"));
                }
                catch (Exception)
                {
                    context.LocalValidationResult.Add(new ValidationResult($"Value of '{jproperty.Path}' is not valid."));
                }
            }

            context.ValidationResult.AddRange(context.LocalValidationResult);

            return !context.LocalValidationResult.Any();
        }

        private async Task PerformEntityReferenceAsync(
            object entity,
            PropertyInfo property,
            ModelPropertyDto? propConfig,
            JToken jValue,
            string jPropertyName,
            object? dbValue,
            List<string>? childFormFields,
            EntityModelBindingContext context,
            Action<object?> action
            )
        {
            // Get the rules of cascade update
            var cascadeAttr = property.GetCustomAttribute<CascadeUpdateRulesAttribute>()
                ?? property.PropertyType.GetCustomAttribute<CascadeUpdateRulesAttribute>()
                ?? (propConfig == null ? null
                    : new CascadeUpdateRulesAttribute(propConfig.CascadeCreate ?? false, propConfig.CascadeUpdate ?? false, propConfig.CascadeDeleteUnreferenced ?? false));

            var propertyType = property.PropertyType.IsGenericType
                ? property.PropertyType.GetGenericArguments()[0]
                : property.PropertyType;

            if (jValue is JObject jEntity)
            {
                var jchildId = jEntity.Property("id")?.Value.ToString();
                var jchildClassName = jEntity.Property(nameof(EntityReferenceDto<int>._className).ToCamelCase())?.Value.ToString();
                var jchildDisplyName = jEntity.Property(nameof(EntityReferenceDto<int>._displayName).ToCamelCase())?.Value.ToString();

                var allowedTypes = propertyType == typeof(GenericEntityReference)
                    ? property.GetCustomAttribute<EntityReferenceAttribute>()?.AllowableTypes
                    : null;
                if (!string.IsNullOrWhiteSpace(jchildClassName) && allowedTypes != null && allowedTypes.Any() && !allowedTypes.Contains(jchildClassName))
                {
                    context.LocalValidationResult.Add(new ValidationResult($"`{jchildClassName}` is not allowed for `{property.Name}`."));
                    return;
                }

                var childEntityType = string.IsNullOrEmpty(jchildClassName)
                    ? JsonEntityProxy.GetUnproxiedType(propertyType)
                    : _entityConfigurationStore.Get(jchildClassName)?.EntityType;
                if (childEntityType == null)
                {
                    context.LocalValidationResult.Add(new ValidationResult($"Type `{jchildClassName}` not found."));
                    return;
                }

                if (!string.IsNullOrEmpty(jchildId))
                {
                    var newChildEntity = dbValue;
                    var childId = dbValue?.GetId()?.ToString();

                    // if child entity is specified
                    if (childId?.ToLower() != jchildId.ToLower()
                        || propertyType.FullName != jchildClassName)
                    {
                        // id or class changed
                        newChildEntity = await GetEntityByIdAsync(childEntityType, jchildId, jchildDisplyName, jPropertyName, context);
                        if (newChildEntity == null)
                        {
                            context.LocalValidationResult.Add(new ValidationResult($"Entity with type `{childEntityType.FullName}` and Id: {jchildId} not found."));
                            return;
                        }
                    }
                    bool r = true;
                    if (jEntity.Properties().ToList().Where(x => x.Name != "id"
                        && x.Name != nameof(EntityReferenceDto<int>._displayName).ToCamelCase()
                        && x.Name != nameof(EntityReferenceDto<int>._className).ToCamelCase()
                        ).Any())
                    {
                        if (!context.SkipValidation && !(cascadeAttr?.CanUpdate ?? false))
                        {
                            context.LocalValidationResult.Add(new ValidationResult($"`{property.Name}` is not allowed to be updated."));
                            return;
                        }
                        r = await BindPropertiesAsync(jEntity, newChildEntity.NotNull(), context, null, childFormFields); 
                        r = r && await _objectValidatorManager.ValidateObjectAsync(newChildEntity, context.LocalValidationResult);
                    }

                    if (dbValue != newChildEntity)
                    {
                        if (r)
                        {
                            if (propertyType == typeof(GenericEntityReference))
                                action(new GenericEntityReference(newChildEntity.NotNull()));
                            else
                                action(newChildEntity);

                        }
                        if (dbValue != null && (cascadeAttr?.DeleteUnreferenced ?? false))
                        {
                            await DeleteUnreferencedEntityAsync(dbValue, entity);
                        }
                    }
                }
                else
                {
                    // if Id is not specified
                    if (jEntity.Properties().ToList().Where(x => x.Name != "id").Any())
                    {
                        if (!(cascadeAttr?.CanCreate ?? false))
                        {
                            context.LocalValidationResult.Add(new ValidationResult($"`{property.Name}` is not allowed to be created."));
                            return;
                        }

                        var childEntity = ActivatorHelper.CreateNotNullObject(childEntityType);
                        // create a new object
                        if (!await BindPropertiesAsync(jEntity, childEntity, context, null, childFormFields))
                            return;

                        if (cascadeAttr?.CascadeEntityCreator != null)
                        {
                            // try to select entity by key fields
                            if (Activator.CreateInstance(cascadeAttr.CascadeEntityCreator) is ICascadeEntityCreator creator)
                            {
                                creator.IocManager = _iocManager;
                                var data = new CascadeRuleEntityFinderInfo(childEntity);
                                if (!creator.VerifyEntity(data, context.LocalValidationResult))
                                    return;

                                data._NewObject = childEntity = creator.PrepareEntity(data);

                                var foundEntity = creator.FindEntity(data);
                                if (foundEntity != null)
                                {
                                    if (await BindPropertiesAsync(jEntity, foundEntity, context, null, childFormFields))
                                        action(foundEntity);
                                    return;
                                }
                            }
                        }

                        action(childEntity);
                    }
                    else
                    {
                        // remove referenced object
                        if (dbValue != null)
                        {
                            action(null);
                            if (cascadeAttr?.DeleteUnreferenced ?? false)
                                await DeleteUnreferencedEntityAsync(dbValue, entity);
                        }
                    }
                }
            }
            else
            {
                var jchildId = jValue.ToString();
                if (!string.IsNullOrEmpty(jchildId))
                {
                    var newChildEntity = dbValue;
                    var childId = dbValue?.GetType().GetProperty("Id")?.GetValue(dbValue)?.ToString();

                    // if child entity is specified
                    if (childId?.ToLower() != jchildId.ToLower())
                    {
                        // id changed
                        newChildEntity = await GetEntityByIdAsync(propertyType, jchildId, "", jPropertyName, context);

                        if (newChildEntity == null)
                        {
                            context.LocalValidationResult.Add(new ValidationResult($"Entity with Id='{jchildId}' not found for `{jPropertyName}`."));
                            return;
                        }
                    }

                    if (dbValue != newChildEntity)
                    {
                        action(newChildEntity);
                        if (dbValue != null && (cascadeAttr?.DeleteUnreferenced ?? false))
                            await DeleteUnreferencedEntityAsync(dbValue, entity);
                    }
                }
            }
        }

        private async Task<object?> GetEntityByIdAsync(Type entityType, string id, string? displayName, string propertyPath, EntityModelBindingContext context)
        {
            if (context.GetEntityById != null)
                return context.GetEntityById(entityType, id, displayName, propertyPath, context);

            var newChildEntity = await _dynamicRepository.GetAsync(entityType, id);
            if (newChildEntity == null)
                context.LocalValidationResult.Add(new ValidationResult($"Entity with Id='{id}' not found for `{propertyPath}`."));

            return newChildEntity;
        }

        private async Task<object?> GetObjectOrObjectReferenceAsync(Type objectType, JObject jobject, EntityModelBindingContext context, List<string>? formFields = null)
        {
            if (context.GetObjectOrObjectReference != null)
                return context.GetObjectOrObjectReference(objectType, jobject, context, formFields);

            var classNameKey = nameof(IJsonEntity._className).ToCamelCase();
            var _className = jobject.ContainsKey(classNameKey)
                ? jobject.GetValue(classNameKey)?.ToString()
                : null;

            if (_className != null)
                objectType = _typeFinder.Find(t => t.FullName == _className).First();

            // use properties binding to validate properties
            var unproxiedType = JsonEntityProxy.GetUnproxiedType(objectType);
            var newItem = Activator.CreateInstance(unproxiedType) ?? throw new Exception($"Failed to create instance of type '{unproxiedType.FullName}'");
            var r = await BindPropertiesAsync(jobject, newItem, context, null, formFields);
            return r ? newItem : null;
        }

        private async Task<bool> ValidateAsync(object obj, string propertyName, object? value, EntityModelBindingContext context)
        {
            return context.SkipValidation && context.LocalSkipValidation || await _objectValidatorManager.ValidatePropertyAsync(obj, propertyName, value, context.ValidationResult);
        }

        public async Task<bool> DeleteCascadeAsync(object entity)
        {
            var entityType = entity.GetType().StripCastleProxyType();
            var props = entityType.GetProperties();
            var result = false;

            var config = await _modelConfigurationManager.GetModelConfigurationAsync(entityType.Namespace, entityType.Name);
            foreach (var prop in props)
            {
                var propConfig = config.Properties.FirstOrDefault(x => x.Name == prop.Name);
                if ((prop.GetCustomAttribute<CascadeUpdateRulesAttribute>()?.DeleteUnreferenced ?? false)
                    || (propConfig?.CascadeDeleteUnreferenced ?? false))
                {
                    var child = prop.GetValue(entity, null);
                    if (child != null)
                    {
                        prop.SetValue(entity, null);
                        result |= await DeleteUnreferencedEntityAsync(child, entity);
                    }
                }
            }

            return result;
        }

        private async Task<bool> DeleteUnreferencedEntityAsync(object entity, object parentEntity)
        {
            var typeShortAlias = entity.GetType().GetCustomAttribute<EntityAttribute>()?.TypeShortAlias;
            var entityType = entity.GetType().StripCastleProxyType();
            var entityTypeName = entityType.FullName;
            var references = _entityPropertyRepository.GetAll().Where(x => x.EntityType == typeShortAlias || x.EntityType == entityTypeName);
            if (!await references.AnyAsync())
                return false;

            var parentId = parentEntity.GetId();
            if (parentId == null)
                throw new CascadeUpdateRuleException("Parent object does not implement IEntity interface");

            var id = entity.GetId();
            if (id == null)
                throw new CascadeUpdateRuleException("Related object does not implement IEntity interface");

            var any = false;
            foreach (var reference in references)
            {
                var refType = _typeFinder.Find(x => x.Namespace == reference.EntityConfig.Namespace
                && (x.Name == reference.EntityConfig.ClassName || x.GetTypeShortAliasOrNull() == reference.EntityConfig.ClassName))
                .FirstOrDefault();
                // Do not raise error becase some EntityConfig can be irrelevant
                if (refType == null || !refType.IsEntityType() || string.IsNullOrWhiteSpace(reference.Name)) 
                    continue;

                var refParam = Expression.Parameter(refType);
                var query = Expression.Lambda(
                    Expression.Equal(
                        Expression.Property(Expression.Property(refParam, reference.Name), "Id"),
                        Expression.Constant(id is Guid ? (Guid)id : id is long ? (long)id : id.ToString())
                        ),
                    refParam);

                var idType = refType.GetProperty("Id")?.PropertyType;
                if (idType == null) continue;
                var repoType = typeof(IRepository<,>).MakeGenericType(refType, idType);
                var repo = _iocManager.Resolve(repoType);
                var getAllMethodName = nameof(IRepository<IEntity<Guid>, Guid>.GetAll);
                var where = (repoType.GetRequiredMethod(getAllMethodName).Invoke(repo, null) as IQueryable).NotNull().Where(query);

                if (refType.IsAssignableFrom(parentEntity.GetType()))
                {
                    var queryExclude = Expression.Lambda(
                        Expression.NotEqual(
                            Expression.Property(refParam, "Id"),
                            Expression.Constant(parentId is Guid ? (Guid)parentId : parentId is long ? (long)parentId : parentId.ToString())
                            ),
                        refParam);
                    where = where.Where(queryExclude);
                }

                try
                {
                    any = where.Any();
                    if (any)
                        break;
                }
                catch {/* skip errors due to incorrect entity configs*/}
            }

            if (!any)
            {
                await DeleteCascadeAsync(entity);
                await _dynamicRepository.DeleteAsync(entity);
                return true;
            }
            return false;
        }

        private string ExtractName(string propName)
        {
            var parts = propName.RemovePostfix(".").Split('.');
            return parts[parts.Length - 1];
        }
    }
}
