using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Extensions;
using Abp.Runtime.Caching;
using Castle.Core.Logging;
using NetTopologySuite.Geometries;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.Json;
using Shesha.EntityReferences;
using Shesha.Metadata;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public class DynamicDtoTypeBuilder : IEventHandler<EntityChangedEventData<EntityProperty>>, IDynamicDtoTypeBuilder, ITransientDependency
    {
        private readonly IEntityConfigCache _entityConfigCache;
        private readonly IEntityConfigurationStore _entityConfigurationStore;

        /// <summary>
        /// Cache of proxy classes
        /// </summary>
        private readonly ITypedCache<string, DynamicDtoProxyCacheItem> _fullProxyCache;
        private readonly ITypedCache<string, Type> _dynamicTypeCache;

        /// <summary>
        /// Reference to the logger to write logs.
        /// </summary>
        public ILogger Logger { protected get; set; } = NullLogger.Instance;

        public DynamicDtoTypeBuilder(
            IEntityConfigCache entityConfigCache,
            IEntityConfigurationStore entityConfigurationStore,
            IFullProxyCacheHolder fullProxyCacheHolder,
            IDynamicTypeCacheHolder _dynamicTypeCacheHolder
        )
        {
            _entityConfigCache = entityConfigCache;
            _entityConfigurationStore = entityConfigurationStore;
            _fullProxyCache = fullProxyCacheHolder.Cache;
            _dynamicTypeCache = _dynamicTypeCacheHolder.Cache;
        }

        /// inheritedDoc
        public Task<Type> BuildDtoProxyTypeAsync(DynamicDtoTypeBuildingContext context)
        {
            return CompileResultTypeAsync(context);
        }

        public async Task<List<EntityPropertyDto>> GetEntityPropertiesAsync(Type entityType)
        {
            return await _entityConfigCache.GetEntityPropertiesAsync(entityType) ?? new();
        }

        public async Task<List<DynamicProperty>> GetDynamicPropertiesAsync(Type type, DynamicDtoTypeBuildingContext context)
        {
            var entityType = DynamicDtoExtensions.GetDynamicDtoEntityType(type);
            if (entityType == null)
                throw new Exception("Failed to extract entity type of the dynamic DTO");

            var properties = new DynamicPropertyList();

            var hardCodedDtoProperties = type.GetProperties().Select(p => p.Name.ToLower()).ToList();

            var configuredProperties = (await GetEntityPropertiesAsync(entityType)).Where(p => !p.Suppress).ToList();
            foreach (var property in configuredProperties)
            {
                // skip property if already included into the DTO (hardcoded)
                if (hardCodedDtoProperties.Contains(property.Name.ToLower()))
                    continue;

                if (string.IsNullOrWhiteSpace(property.DataType))
                {
                    Logger.Warn($"Type '{type.FullName}': {nameof(property.DataType)} of property {property.Name} is empty");
                    continue;
                }


                try
                {
                    var propertyType = await GetDtoPropertyTypeAsync(property, context);
                    if (propertyType != null)
                        properties.Add(property.Name, propertyType);
                }
                catch (NotSupportedException ex) 
                {
                    Logger.Warn($"Type '{type.FullName}': failed to add property `{property.Name}` of type `{property.DataType}`", ex);
                    continue;
                }                
            }

            // internal fields
            if (context.AddFormFieldsProperty)
                properties.Add(nameof(IHasFormFieldsList._formFields), typeof(List<string>));

            return properties;
        }

        /// <summary>
        /// Returns .Net type that is used to store data for the specified DTO property (according to the property settings)
        /// </summary>
        public async Task<Type?> GetDtoPropertyTypeAsync(EntityPropertyDto propertyDto, DynamicDtoTypeBuildingContext context)
        {
            var dataType = propertyDto.DataType;
            var dataFormat = propertyDto.DataFormat;

            switch (dataType)
            {
                case DataTypes.Guid:
                    return typeof(Guid?);
                case DataTypes.String:
                    return typeof(string);
                case DataTypes.Geometry:
                    return typeof(Geometry);
                case DataTypes.Date:
                case DataTypes.DateTime:
                    return typeof(DateTime?);
                case DataTypes.Time:
                    return typeof(TimeSpan?);
                case DataTypes.Boolean:
                    return typeof(bool?);
                case DataTypes.ReferenceListItem:
                    // todo: find a way to check an entity property
                    // if it's declared as an enum - get base type of this enum
                    // if it's declared as int/Int64 - use this type
                    return typeof(Int64?);

                case DataTypes.Number:
                    {
                        switch (dataFormat)
                        {
                            case NumberFormats.Int32:
                                return typeof(int?);
                            case NumberFormats.Int64:
                                return typeof(Int64?);
                            case NumberFormats.Float:
                                return typeof(float?);
                            case NumberFormats.Double:
                                return typeof(decimal?);
                            default:
                                return typeof(decimal?);
                        }
                    }

                case DataTypes.EntityReference:
                    if (propertyDto.EntityType.IsNullOrWhiteSpace())
                        return typeof(GenericEntityReference);
                    else
                        return GetEntityReferenceType(propertyDto, context);
                
                case DataTypes.File:
                    return typeof(StoredFile);

                case DataTypes.Array:
                    if (propertyDto.ItemsType != null)
                    {
                        var nestedType = await GetDtoPropertyTypeAsync(propertyDto.ItemsType, context);
                        var arrayType = typeof(List<>).MakeGenericType(nestedType.NotNull());
                        return arrayType;
                    }
                    return null;
                case DataTypes.Object: // JSON content
                    if (dataFormat == ObjectFormats.Object)
                        return await GetNestedTypeAsync(propertyDto, context); 
                    if (dataFormat == ObjectFormats.Interface)
                        return typeof(object);
                    throw new NotSupportedException($"Data type not supported: {dataType} {dataFormat}");
                case DataTypes.Advanced:
                    return null;
                default:
                    throw new NotSupportedException($"Data type not supported: {dataType}");
            }
        }

        private Type? GetEntityReferenceType(EntityPropertyDto propertyDto, DynamicDtoTypeBuildingContext context)
        {
            if (propertyDto.DataType != DataTypes.EntityReference)
                throw new NotSupportedException($"DataType {propertyDto.DataType} is not supported. Expected {DataTypes.EntityReference}");

            if (string.IsNullOrWhiteSpace(propertyDto.EntityType))
                return null;

            var entityConfig = _entityConfigurationStore.Get(propertyDto.EntityType);
            if (entityConfig == null || entityConfig.IdType == null)
                return null;

            return context.UseDtoForEntityReferences
                ? typeof(EntityReferenceDto<>).MakeGenericType(entityConfig.IdType)
                : typeof(Nullable<>).MakeGenericType(entityConfig.IdType);
        }

        private async Task<Type> GetNestedTypeAsync(EntityPropertyDto propertyDto, DynamicDtoTypeBuildingContext context)
        {
            var t = await _dynamicTypeCache.GetOrDefaultAsync(propertyDto.Id.ToString());
            if (t == null)
            {
                t = propertyDto.Properties?.Any() ?? false
                    ? propertyDto.DataFormat == ObjectFormats.Interface
                        ? typeof(object)
                        : await BuildNestedTypeAsync(propertyDto, context)
                    : typeof(object);
                await _dynamicTypeCache.SetAsync(propertyDto.Id.ToString(), t);
            }
            return t;

            // do not use factory because there can be nested properties and it leads to lock
            //return await DynamicTypeCache.GetAsync(propertyDto.Id.ToString(), async key => await BuildNestedTypeAsync(propertyDto, context));
        }

        private async Task<Type> BuildNestedTypeAsync(EntityPropertyDto propertyDto, DynamicDtoTypeBuildingContext context)
        {
            if (propertyDto.DataType != DataTypes.Object)
                throw new NotSupportedException($"{nameof(BuildNestedTypeAsync)}: unsupported type of property (expected '{DataTypes.Object}', actual: '{propertyDto.DataType}')");

            // todo: build name of the class according ot the level of the property
            using (context.OpenNamePrefix(propertyDto.Name))
            {
                var className = context.CurrentPrefix.Replace('.', '_');

                var tb = GetTypeBuilder(typeof(object), className, new List<Type> { typeof(IDynamicNestedObject) });
                var constructor = tb.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

                foreach (var property in propertyDto.Properties)
                {
                    var propertyType = await GetDtoPropertyTypeAsync(property, context);
                    CreateProperty(tb, property.Name, propertyType.NotNull());
                }

                if (!propertyDto.Properties.Any(p => p.Name == nameof(IHasClassNameField._className)))
                    CreateProperty(tb, nameof(IHasClassNameField._className), typeof(string));

                var objectType = tb.CreateType();

                context.ClassCreated(objectType);

                return objectType;
            }
        }

        private async Task<Type> CompileResultTypeAsync(DynamicDtoTypeBuildingContext context)
        {
            var proxyClassName = GetProxyTypeName(context.ModelType, "Proxy");

            var tb = GetTypeBuilder(context.ModelType, proxyClassName, new List<Type> { typeof(IDynamicDtoProxy) });
            var constructor = tb.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

            using (context.OpenNamePrefix(proxyClassName))
            {
                var properties = await GetDynamicPropertiesAsync(context.ModelType, context);

                foreach (var property in properties)
                {
                    if (context.PropertyFilter == null || context.PropertyFilter.Invoke(property.PropertyName))
                        CreateProperty(tb, property.PropertyName, property.PropertyType);
                }

                var objectType = tb.CreateType();

                context.ClassCreated(objectType);

                return objectType;
            }
        }

        private TypeBuilder GetTypeBuilder(Type baseType, string typeName, IEnumerable<Type> interfaces)
        {
            var assemblyName = new AssemblyName($"{typeName}Assembly");
            var moduleName = $"{typeName}Module";

            var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(assemblyName, AssemblyBuilderAccess.RunAndCollect);
            var moduleBuilder = assemblyBuilder.DefineDynamicModule(moduleName);
            var tb = moduleBuilder.DefineType(typeName,
                    TypeAttributes.Public |
                    TypeAttributes.Class |
                    TypeAttributes.AutoClass |
                    TypeAttributes.AnsiClass |
                    TypeAttributes.BeforeFieldInit |
                    TypeAttributes.AutoLayout,
                    baseType,
                    interfaces.ToArray());
            return tb;
        }

        private static void CreateProperty(TypeBuilder tb, string propertyName, Type propertyType)
        {
            var fieldBuilder = tb.DefineField("_" + propertyName, propertyType, FieldAttributes.Private);

            var propertyBuilder = tb.DefineProperty(propertyName, PropertyAttributes.HasDefault, propertyType, null);
            var getPropMthdBldr = tb.DefineMethod("get_" + propertyName,
                MethodAttributes.Public |
                MethodAttributes.SpecialName |
                MethodAttributes.HideBySig |
                MethodAttributes.Virtual,
                propertyType,
                Type.EmptyTypes);
            ILGenerator getIl = getPropMthdBldr.GetILGenerator();

            getIl.Emit(OpCodes.Ldarg_0);
            getIl.Emit(OpCodes.Ldfld, fieldBuilder);
            getIl.Emit(OpCodes.Ret);

            var setPropMthdBldr =
                tb.DefineMethod("set_" + propertyName,
                  MethodAttributes.Public |
                  MethodAttributes.SpecialName |
                  MethodAttributes.HideBySig |
                  MethodAttributes.Virtual,
                  null, new[] { propertyType });

            ILGenerator setIl = setPropMthdBldr.GetILGenerator();
            var modifyProperty = setIl.DefineLabel();
            var exitSet = setIl.DefineLabel();

            setIl.MarkLabel(modifyProperty);
            setIl.Emit(OpCodes.Ldarg_0);
            setIl.Emit(OpCodes.Ldarg_1);
            setIl.Emit(OpCodes.Stfld, fieldBuilder);

            setIl.Emit(OpCodes.Nop);
            setIl.MarkLabel(exitSet);
            setIl.Emit(OpCodes.Ret);

            propertyBuilder.SetGetMethod(getPropMthdBldr);
            propertyBuilder.SetSetMethod(setPropMthdBldr);

            AddPropertyAttributes(propertyBuilder, propertyType);
        }

        private static void AddPropertyAttributes(PropertyBuilder propertyBuilder, Type propertyType)
        {
            if (propertyType == typeof(DateTime) || propertyType == typeof(DateTime?))
            {
                var attrCtorParams = new Type[] { typeof(Type) };
                var attrCtorInfo = typeof(JsonConverterAttribute).GetConstructor(attrCtorParams).NotNull($"Constructor not found in type '{typeof(JsonConverterAttribute).FullName}'");
                var attrBuilder = new CustomAttributeBuilder(attrCtorInfo, [typeof(DateConverter)]);
                propertyBuilder.SetCustomAttribute(attrBuilder);
            }
        }

        private string GetProxyTypeName(Type type, string suffix)
        {
            if (type.IsDynamicDto())
            {
                var entityType = type.GetDynamicDtoEntityType().NotNull();
                return $"DynamicDto_{entityType.Name}{suffix}";
            }
            else
                return $"{type.Name}{suffix}";
        }

        public async Task<Type> BuildDtoFullProxyTypeAsync(Type baseType, DynamicDtoTypeBuildingContext context)
        {
            var cacheKey = GetTypeCacheKey(baseType, context);
            var cachedDtoItem = await _fullProxyCache.GetOrDefaultAsync(cacheKey);
            if (cachedDtoItem != null)
            {
                context.Classes = cachedDtoItem.NestedClasses.ToDictionary(i => i.Key, i => i.Value);
                return cachedDtoItem.DtoType;
            }

            var proxyClassName = GetProxyTypeName(baseType, "FullProxy");
            var properties = await GetDynamicPropertiesAsync(baseType, context);

            if (!properties.Any(p => p.PropertyName == nameof(IHasClassNameField._className)))
                properties.Add(new DynamicProperty { PropertyName = nameof(IHasClassNameField._className), PropertyType = typeof(string) });

            if (context.AddFormFieldsProperty && !properties.Any(p => p.PropertyName == nameof(IHasFormFieldsList._formFields)))
                properties.Add(new DynamicProperty { PropertyName = nameof(IHasFormFieldsList._formFields), PropertyType = typeof(List<string>) });

            var interfaces = new List<Type>();
            if (context.AddFormFieldsProperty)
                interfaces.Add(typeof(IHasFormFieldsList));

            var type = await CompileResultTypeAsync(baseType, proxyClassName, interfaces, properties, context);

            await _fullProxyCache.SetAsync(cacheKey, new DynamicDtoProxyCacheItem
            {
                DtoType = type,
                NestedClasses = context.Classes.ToDictionary(i => i.Key, i => i.Value)
            });

            return type;
        }

        private Task<Type> CompileResultTypeAsync(Type baseType,
            string proxyClassName,
            List<Type> interfaces,
            List<DynamicProperty> properties,
            DynamicDtoTypeBuildingContext context)
        {
            var tb = GetTypeBuilder(baseType, proxyClassName, interfaces.Union(new List<Type> { typeof(IDynamicDtoProxy) }));
            var constructor = tb.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

            foreach (var property in properties)
            {
                CreateProperty(tb, property.PropertyName, property.PropertyType);
            }

            var objectType = tb.CreateType();

            context.ClassCreated(objectType);

            return Task.FromResult(objectType);
        }


        private string GetTypeCacheKey(Type type, DynamicDtoTypeBuildingContext context)
        {
            var entityType = DynamicDtoExtensions.GetDynamicDtoEntityType(type);
            if (entityType == null)
                throw new NotSupportedException($"Type '{type.FullName}' is not a dynamic DTO");

            return GetTypeCacheKey(entityType.FullName.NotNull(), context.AddFormFieldsProperty, context.UseDtoForEntityReferences);
        }

        private string GetTypeCacheKey(string typeName, bool formFields, bool useEntityDtos)
        {
            return $"{typeName}|formFields:{formFields.ToString().ToLower()}|useEntityDtos:{useEntityDtos.ToString().ToLower()}";
        }

        public void HandleEvent(EntityChangedEventData<EntityProperty> eventData)
        {
            if (eventData.Entity == null)
                return;

            var entityConfig = eventData.Entity.EntityConfig;
            if (entityConfig != null)
            {
                // TODO: V1 review take versions into account
                // remove all variation of Entity cache items
                var cacheKey = GetTypeCacheKey(entityConfig.FullClassName, false, false);
                _fullProxyCache.Remove(cacheKey);
                cacheKey = GetTypeCacheKey(entityConfig.FullClassName, false, true);
                _fullProxyCache.Remove(cacheKey);
                cacheKey = GetTypeCacheKey(entityConfig.FullClassName, true, false);
                _fullProxyCache.Remove(cacheKey);
                cacheKey = GetTypeCacheKey(entityConfig.FullClassName, true, true);
                _fullProxyCache.Remove(cacheKey);
            }

            var prop = eventData.Entity;
            while (prop != null)
            {
                _dynamicTypeCache.Remove(prop.Id.ToString());
                prop = prop.ParentProperty;
            }
        }
    }
}