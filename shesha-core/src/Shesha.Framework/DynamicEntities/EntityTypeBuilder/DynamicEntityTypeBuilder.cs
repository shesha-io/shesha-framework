using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Reflection;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using NetTopologySuite.Geometries;
using Newtonsoft.Json.Linq;
using Shesha.Attributes;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities.EntityTypeBuilder.Model;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Metadata;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    /// <summary>
    /// 
    /// </summary>
    public class DynamicEntityTypeBuilder : IDynamicEntityTypeBuilder, ISingletonDependency
    {
        public const string SheshaDynamicNamespace = "ShaDynamic";

        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepo;
        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;
        private readonly ApplicationPartManager _appPartManager;
        private readonly IModuleList _moduleList;
        private readonly ITypeFinder _typeFinder;
        private readonly ILogger _logger;

        public DynamicEntityTypeBuilder(
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<EntityProperty, Guid> propertyConfigRepo,
            IRepository<EntityConfig, Guid> entityConfigRepo,
            ApplicationPartManager appPartManager,
            IModuleList moduleList,
            ITypeFinder typeFinder,
            ILogger logger
        )
        {
            _unitOfWorkManager = unitOfWorkManager;
            _propertyConfigRepo = propertyConfigRepo;
            _entityConfigRepo = entityConfigRepo;
            _appPartManager = appPartManager;
            _moduleList = moduleList;
            _typeFinder = typeFinder;
            _logger = logger;
        }

        public List<Type> GenerateTypes(IEntityConfigurationStore entityConfigurationStore)
        {
            List<Type> list;
            using (var unitOfWork = _unitOfWorkManager.Begin())
            {
                using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    list = GenerateTypesInternal(entityConfigurationStore);
                }
                unitOfWork.Complete();
            }
            return list;
        }

        private List<Type> GenerateTypesInternal(IEntityConfigurationStore entityConfigurationStore)
        {
            _logger.Warn("DynamicEntityTypeBuilder: GetTypes");

            var context = new EntityTypeBuilderContext() { EntityConfigurationStore = entityConfigurationStore };
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();

            // Get all user configs
            var userConfigs = _entityConfigRepo.GetAll().Where(x => x.Source == Domain.Enums.MetadataSourceType.UserDefined && !x.IsDeleted).ToList();

            // Generate dynamic assembly per module
            CreateDynamicAssemblies(context, assemblies, userConfigs);

            // Create all type builders without creating types to get all types for reference properties
            CreateTypeBuilders(userConfigs, context);

            // Process all type builders to create types with all properties
            var types = context.Types.Map(t => CreateType(t, context));

            // Refresh Application Parts
            foreach (var module in context.ModuleBuilders)
            {
                var assembly = module.Value.Assembly;
                var assemblyName = assembly.GetName();
                // Remove old assembly from the application part to remove old CRUD APIs
                var oldAssemblyPart = _appPartManager?.ApplicationParts
                    .FirstOrDefault(x =>
                        (x as AssemblyPart)?.Assembly.GetName().Name == assemblyName.Name
                        && (x as AssemblyPart)?.Assembly.GetName().Version.NotNull().Minor == (assemblyName.Version.NotNull().Minor - 1)
                    );

                if (_appPartManager != null && oldAssemblyPart != null)
                    _appPartManager.ApplicationParts.Remove(oldAssemblyPart);

                // Add new assembly to the application part to create new CRUD APIs
                var newAssembly = assemblies.FirstOrDefault(x => x.GetName().Version.NotNull().Minor == assemblyName.Version.NotNull().Minor);
                if (_appPartManager != null && newAssembly != null)
                    _appPartManager.ApplicationParts.Add(new AssemblyPart(newAssembly));
            }

            // Run the Garbage Collector in an attempt to unload old unused dynamic entities assemblies
            GC.Collect();
            GC.WaitForPendingFinalizers();

            return types;
        }

        private void CreateDynamicAssemblies(EntityTypeBuilderContext context, Assembly[] assemblies, List<EntityConfig> userConfigs)
        {
            // Group by module
            var configsModules = userConfigs.GroupBy(x => x.Module).ToList();

            // generate dynamic assembly per module
            foreach (var moduleGroup in configsModules)
            {
                // get Namespace from the first config since all configs on the group from the one Module
                var assembluNamespace = moduleGroup.FirstOrDefault()?.Namespace ?? SheshaDynamicNamespace; // module.Key?.Name ?? DynamicEntityTypeBuilder.SheshaDynamicNamespace;
                var prevs = assemblies
                    .Where(x => x.IsDynamic && (x.FullName?.Contains(assembluNamespace) ?? false))
                    .ToList();

                // Calculate new version of assembly
                var assembliesNames = prevs.Select(x => x.GetName()).ToList();
                var lastAssemblyName = assembliesNames.OrderBy(x => x.ToString()).LastOrDefault();
                var assemblyName = new AssemblyName(assembluNamespace);
                assemblyName.Version = new Version(1, (lastAssemblyName?.Version?.Minor ?? 0) + 1);

                // ToDo: AS - need to find solution to use AssemblyBuilderAccess.RunAndCollect for collecting old assemblies
                var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(assemblyName, AssemblyBuilderAccess.Run);
                var module = moduleGroup.Key;
                if (module != null)
                {
                    // Assembly Attributes
                    // Set Module
                    var assemblyAttribute = typeof(DynamicAssemblyModuleAttribute).GetConstructor(new Type[] {
                        typeof(string), typeof(string), typeof(string), typeof(string), typeof(string), typeof(bool)
                    });
                    var assemblyAttributeBuilder = new CustomAttributeBuilder(assemblyAttribute.NotNull(), new object[] {
                        module.Name, "", module.FriendlyName ?? "", module.Publisher ?? "", module.Description ?? "",
                        // ToDo: AS - check for Main Module
                        true,
                    });
                    assemblyBuilder.SetCustomAttribute(assemblyAttributeBuilder);

                    // Set table prefix
                    // ToDo: AS V1 - get correct prefix from name conventions
                    var schemaName = module != null
                        ? MappingHelper.GetTablePrefix((_moduleList.Modules.FirstOrDefault(x => x.ModuleInfo.Name == module.Name)?.Assembly).NotNull())
                        : null;
                    schemaName = schemaName.IsNullOrEmpty()
                        ? (module?.Accessor).IsNullOrEmpty()
                            ? module?.Name.ToCamelCase()
                            : module?.Accessor
                        : schemaName;
                    var tablePrefixAttribute = typeof(TablePrefixAttribute).GetConstructor(new Type[] { typeof(string) });
                    var tablePrefixAttributeBuilder = new CustomAttributeBuilder(tablePrefixAttribute.NotNull(), new object[] { schemaName.NotNull() });
                    assemblyBuilder.SetCustomAttribute(tablePrefixAttributeBuilder);
                }

                var moduleBuilder = assemblyBuilder.DefineDynamicModule(assemblyName.Name.NotNull());
                context.ModuleBuilders.Add(moduleGroup.Key.NotNull(), moduleBuilder);
            }
        }

        public void CreateTypeBuilders(List<EntityConfig> configs, EntityTypeBuilderContext context)
        {
            var allCount = configs.Count;
            var sortedToAdd = configs.Where(x => configs.All(y => x.InheritedFrom != y)).ToList();
            var nextLevel = configs.Where(x => sortedToAdd.Any(y => x.InheritedFrom == y)).ToList();
            while (sortedToAdd.Count < allCount && nextLevel.Count > 0)
            {
                sortedToAdd.AddRange(nextLevel);
                nextLevel = configs.Where(x => !sortedToAdd.Contains(x) && sortedToAdd.Any(y => x.InheritedFrom == y)).ToList();
            }
            foreach (var config in sortedToAdd.Where(x => !x.IsDeleted).ToList())
            {
                var moduleBuilder = context.ModuleBuilders.FirstOrDefault(x => x.Key == config.Module).Value;
                CreateTypeBuilder(moduleBuilder, config, context);
            }
        }

        public Type CreateType(EntityTypeBuilderType typeBuilderType, EntityTypeBuilderContext context)
        {
            var properties = _propertyConfigRepo.GetAll().Where(x => x.EntityConfig.Id == typeBuilderType.EntityConfig.Id && !x.IsDeleted).ToList();
            return CreateType(typeBuilderType, properties, context);
        }

        public EntityTypeBuilderType CreateTypeBuilder(ModuleBuilder moduleBuilder, EntityConfig entityConfig, EntityTypeBuilderContext context)
        {
            // ToDo: AS - remove logging
            _logger.Warn($"DynamicEntityTypeBuilder: CreateTypeBuilder - {entityConfig.Accessor}");

            Type? baseType = null;

            // Find first not deleted config (or null)
            var baseConfig = entityConfig.InheritedFrom;
            while (baseConfig != null && baseConfig.IsDeleted && baseConfig.InheritedFrom != null)
                baseConfig = baseConfig.InheritedFrom;

            if (entityConfig.InheritedFrom != null)
            {
                if (entityConfig.InheritedFrom.Source == Domain.Enums.MetadataSourceType.ApplicationCode)
                {
                    baseType = _typeFinder.Find(x => x.Name == entityConfig.InheritedFrom.ClassName && x.Namespace == entityConfig.InheritedFrom.Namespace).FirstOrDefault();
                }
                else
                {
                    var inheritedFrom = context.Types.FirstOrDefault(x => x.EntityConfig == baseConfig);
                    baseType = inheritedFrom?.Type ?? inheritedFrom?.TypeBuilder;
                }
            }

            baseType = baseType ?? (
                entityConfig.EntityConfigType == Domain.Enums.EntityConfigTypes.Class
                    ? typeof(FullPowerEntity)
                    : typeof(JsonEntity)
                );

            // Base class info
            var typeBuilder = moduleBuilder.DefineType($"{moduleBuilder.Assembly.GetName().Name}.{entityConfig.ClassName}",
                    TypeAttributes.Public |
                    TypeAttributes.Class |
                    TypeAttributes.AutoClass |
                    TypeAttributes.AnsiClass |
                    TypeAttributes.BeforeFieldInit |
                    TypeAttributes.AutoLayout,
                    baseType,
                    entityConfig.EntityConfigType == Domain.Enums.EntityConfigTypes.Class
                        ? [ typeof(IEntity<Guid>) ]
                        : null );

            // Class Attributes
            if (entityConfig.EntityConfigType == Domain.Enums.EntityConfigTypes.Class)
            {
                // Set Table
                SetAttribute(
                    typeBuilder,
                    typeof(TableAttribute),
                    [entityConfig.TableName.NotNull()],
                    new Dictionary<string, object?> { { "Schema", entityConfig.SchemaName } }
                );
                // Set Discriminator
                SetAttribute(typeBuilder, typeof(DiscriminatorAttribute), []);
                SetAttribute(typeBuilder, typeof(DiscriminatorValueAttribute), [entityConfig.DiscriminatorValue.NotNull()]);
                // Set name convention
                SetAttribute(typeBuilder, typeof(SnakeCaseNamingAttribute), []);
            }

            var typeBuilderType = new EntityTypeBuilderType()
            {
                EntityConfig = entityConfig,
                Type = null,
                TypeBuilder = typeBuilder,
            };
            context.Types.Add(typeBuilderType);

            return typeBuilderType;
        }

        private void SetAttribute(TypeBuilder builder, Type attributeType, object[] arguments, Dictionary<string, object?>? properties = null)
        {
            var argTypes = arguments.Select(x => x.GetType()).ToArray();
            var attribute = attributeType.GetConstructor(argTypes);
            if (properties?.Count > 0)
            {
                var props = properties
                    .Select(x => x.Value != null ? attributeType.GetProperty(x.Key).NotNull() : null)
                    .Where(x => x != null)
                    .Select(x => x.NotNull())
                    .ToArray();
                var values = properties.Values.Where(x => x != null).ToArray();
                var attributeBuilder = new CustomAttributeBuilder(attribute.NotNull(), arguments, props, values);
                builder.SetCustomAttribute(attributeBuilder);
            }
            else
            {
                var attributeBuilder = new CustomAttributeBuilder(attribute.NotNull(), arguments);
                builder.SetCustomAttribute(attributeBuilder);
            }
        }

        public Type CreateType(EntityTypeBuilderType typeBuilderType, List<EntityProperty>? properties, EntityTypeBuilderContext context)
        {
            // ToDo: AS - remove logging
            _logger.Warn($"DynamicEntityTypeBuilder: CreateType (typeBuilderType) - {typeBuilderType.TypeBuilder.FullName}");

            // Class properties
            if (properties != null)
            {
                var existProperties = typeBuilderType.TypeBuilder.BaseType?.GetProperties();
                var propertiesToAdd = properties.Where(x =>
                    x.Name != "Id"
                    && (!existProperties?.Any(y => y.Name == x.Name) ?? true)
                    && x.ParentProperty == null
                );
                foreach (var property in propertiesToAdd)
                {
                    var propType = GetPropertyType(property, context);
                    if (propType != null)
                        CreateProperty(typeBuilderType.TypeBuilder, property, propType);
                }
            }

            var type = typeBuilderType.TypeBuilder.CreateType();
            typeBuilderType.Type = type;

            return type;
        }

        public void CreateProperty(TypeBuilder tb, EntityProperty property, Type propertyType)
        {
            var propertyName = property.Name;
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

            // Column Attributes

            // Set ColumnName to avoid incorrect mapping
            if (!string.IsNullOrWhiteSpace(property.ColumnName))
                SetAttribute(propertyBuilder, typeof(ColumnAttribute), [property.ColumnName]);

            switch (property.DataType)
            {
                case DataTypes.ReferenceListItem:
                    SetAttribute(propertyBuilder, typeof(ReferenceListAttribute), [property.ReferenceListModule.NotNull(), property.ReferenceListName.NotNull()]);
                    break;
                case DataTypes.Object:
                    SetAttribute(propertyBuilder, typeof(SaveAsJsonAttribute), []);
                    break;

                case DataTypes.Array:
                    if (property.DataFormat == ArrayFormats.MultivalueReferenceList)
                        SetAttribute(propertyBuilder, typeof(MultiValueReferenceListAttribute),
                            [property.ReferenceListModule.NotNull("Reference List Module must not be null"),
                                property.ReferenceListName.NotNull("Reference List Name must not be null")
                            ]);
                    if (property.DataFormat == ArrayFormats.ChildObjects || property.DataFormat == ArrayFormats.Simple)
                        SetAttribute(propertyBuilder, typeof(SaveAsJsonAttribute), []);
                    if (property.DataFormat == ArrayFormats.EntityReference && !(property.ListConfiguration?.ForeignProperty).IsNullOrWhiteSpace())
                    {
                        SetAttribute(propertyBuilder, typeof(DynamicManyToOneAttribute), [(property.ListConfiguration?.ForeignProperty).NotNull()]);
                    }
                    if (property.DataFormat == ArrayFormats.ManyToManyEntities)
                    {
                        SetAttribute(propertyBuilder, typeof(ManyToManyAttribute),
                            [(property.ListConfiguration?.DbMapping?.ManyToManyTableName).NotNull("TableName most not be null"),
                                (property.ListConfiguration?.DbMapping?.ManyToManyChildColumnName).NotNull("ChildColumnName most not be null"),
                                (property.ListConfiguration?.DbMapping?.ManyToManyKeyColumnName).NotNull("KeyColumnName most not be null")
                            ]);
                    }
                    break;
            }
        }

        private void SetAttribute(PropertyBuilder propertyBuilder, Type attributeType, object[] arguments)
        {
            var argTypes = arguments.Select(x => x.GetType()).ToArray();
            var attribute = attributeType.GetConstructor(argTypes);
            var attributeBuilder = new CustomAttributeBuilder(attribute.NotNull(), arguments);
            propertyBuilder.SetCustomAttribute(attributeBuilder);
        }

        /// <summary>
        /// Returns .Net type that is used to store data (according to the property settings)
        /// </summary>
        public Type? GetPropertyType(EntityProperty property, EntityTypeBuilderContext context)
        {
            var dataType = property.DataType;
            var dataFormat = property.DataFormat;

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
                    return typeof(long?);

                case DataTypes.Number:
                    {
                        switch (dataFormat)
                        {
                            case NumberFormats.Int32:
                                return typeof(int?);
                            case NumberFormats.Int64:
                                return typeof(long?);
                            case NumberFormats.Float:
                                return typeof(float?);
                            case NumberFormats.Double:
                                return typeof(decimal?);
                            default:
                                return typeof(decimal?);
                        }
                    }

                case DataTypes.EntityReference:
                    return property.EntityType.IsNullOrWhiteSpace()
                        ? typeof(GenericEntityReference)
                        : GetReferenceType(property, context);

                case DataTypes.File:
                    return typeof(StoredFile);

                case DataTypes.Object:
                    return !property.EntityType.IsNullOrWhiteSpace()
                        ? GetReferenceType(property, context)
                        : dataFormat == ObjectFormats.Object
                            ? typeof(JObject)
                            : typeof(JsonEntity);

                case DataTypes.Array:
                    if (dataFormat == ArrayFormats.MultivalueReferenceList)
                        return typeof(long?);
                    if (property.ItemsType != null)
                    {
                        var nestedType = GetPropertyType(property.ItemsType, context);
                        var arrayType = typeof(IList<>).MakeGenericType(nestedType.NotNull());
                        return arrayType;
                    }
                    return null;
                default:
                    // ToDo: AS - need to decide ignore wrong properties or raise exception (write critical log)
                    return null;
                    throw new NotSupportedException($"Data type not supported: {dataType}");
            }
        }

        private Type GetReferenceType(EntityProperty property, EntityTypeBuilderContext context)
        {
            if (property.DataType != DataTypes.EntityReference && property.DataType != DataTypes.Object)
                throw new NotSupportedException($"DataType {property.DataType} is not supported. Expected {DataTypes.EntityReference} or {DataTypes.Object}");

            if (string.IsNullOrWhiteSpace(property.EntityType))
                throw new EntityTypeNotFoundException("Entity type is empty");

            var refType = context.Types.FirstOrDefault(x => x.EntityConfig.FullClassName == property.EntityType);

            var entityType = refType?.Type ?? refType?.TypeBuilder
                ?? context.EntityConfigurationStore.GetOrNull(property.EntityType)?.EntityType // try to find in the EntityConfigurationStore by ClassName and TypeShortAlias
                ?? _typeFinder.Find(x => x.FullName == property.EntityType).FirstOrDefault();
            if (entityType == null)
                throw new EntityTypeNotFoundException(property.EntityType.NotNull());
            return entityType;
        }
    }
}
