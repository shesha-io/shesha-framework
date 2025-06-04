using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Reflection;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using NetTopologySuite.Geometries;
using Shesha.Attributes;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities.EntityTypeBuilder.Model;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    /// <summary>
    /// 
    /// </summary>
    public class DynamicEntityTypeBuilder : IDynamicEntityTypeBuilder, ISingletonDependency
    {
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
            var userConfigs = _entityConfigRepo.GetAll().Where(x => x.Source == Domain.Enums.MetadataSourceType.UserDefined).ToList();
            // Group by module
            var configsModules = userConfigs.GroupBy(x => x.Module).ToList();

            // generate dynamic assembly per module
            foreach (var moduleGroup in configsModules)
            {
                // get Namespace from the first config since all configs on the group from the one Module
                var assembluNamespace = moduleGroup.FirstOrDefault()?.Namespace ?? "ShaDynamic"; // module.Key?.Name ?? "ShaDynamic";
                var prevs = assemblies
                    .Where(x => x.IsDynamic && (x.FullName?.Contains(assembluNamespace) ?? false))
                    .ToList();

                // Calculate new version of assembly
                var assembliesNames = prevs.Select(x => x.GetName()).ToList();
                var lastAssemblyName = assembliesNames.OrderBy(x => x.ToString()).LastOrDefault();
                var assemblyName = new AssemblyName(assembluNamespace);
                assemblyName.Version = new Version(1, (lastAssemblyName?.Version?.Minor ?? 0) + 1);

                var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(assemblyName, AssemblyBuilderAccess.RunAndCollect);
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
                    var tablePrefix = 
                        MappingHelper.GetTablePrefix((_moduleList.Modules.FirstOrDefault(x => x.ModuleInfo.Name == module.Name)?.ModuleType.Assembly).NotNull())
                        ?? module.Name;
                    var tablePrefixAttribute = typeof(TablePrefixAttribute).GetConstructor(new Type[] { typeof(string) });
                    var tablePrefixAttributeBuilder = new CustomAttributeBuilder(tablePrefixAttribute.NotNull(), new object[] { tablePrefix });
                    assemblyBuilder.SetCustomAttribute(tablePrefixAttributeBuilder);
                }

                var moduleBuilder = assemblyBuilder.DefineDynamicModule(assemblyName.Name.NotNull());
                context.ModuleBuilders.Add(moduleGroup.Key.NotNull(), moduleBuilder);
            }

            // Create all type builders without creating types to get all types for reference properties
            CreateTypeBuilders(userConfigs, context);

            // Process all type builders to create types with all properties
            var types = new List<Type>();
            foreach (var typeBuilderType in context.Types)
                types.Add(CreateType(typeBuilderType, context));
            
            // Refresh Application Parts
            foreach(var module in context.ModuleBuilders)
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

        // ToDo: AS - remove after implementation
        /*public void CreateTypeBuilders(ModuleBuilder moduleBuilder, List<EntityConfig> configs, EntityTypeBuilderContext context)
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
                CreateTypeBuilder(moduleBuilder, config, context);
            }
        }*/

        // ToDo: AS - remove after implementation
        /*public List<Type> CreateTypes(ModuleBuilder moduleBuilder, List<EntityConfig> configs, EntityTypeBuilderContext context)
        {
            var allCount = configs.Count;
            var sortedToAdd = configs.Where(x => configs.All(y => x.InheritedFrom != y)).ToList();
            var nextLevel = configs.Where(x => sortedToAdd.Any(y => x.InheritedFrom == y)).ToList();
            while (sortedToAdd.Count < allCount && nextLevel.Count > 0)
            {
                sortedToAdd.AddRange(nextLevel);
                nextLevel = configs.Where(x => !sortedToAdd.Contains(x) && sortedToAdd.Any(y => x.InheritedFrom == y)).ToList();
            }

            var types = new List<Type>();
            // Create only not deleted
            foreach (var config in sortedToAdd.Where(x => !x.IsDeleted).ToList())
            {
                types.Add(CreateType(moduleBuilder, config, context));
            }

            return types;
        }*/

        // ToDo: AS - remove after implementation
        /*
        public Type CreateType(ModuleBuilder moduleBuilder, EntityConfig entityConfig, EntityTypeBuilderContext context)
        {
            var properties = _propertyConfigRepo.GetAll().Where(x => x.EntityConfig == entityConfig).ToList();
            return CreateType(moduleBuilder, entityConfig, properties, context);
        }*/

        public Type CreateType(EntityTypeBuilderType typeBuilderType, EntityTypeBuilderContext context)
        {
            var properties = _propertyConfigRepo.GetAll().Where(x => x.EntityConfig == typeBuilderType.EntityConfig).ToList();
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
                    //baseTypeBuilder = context.Types.FirstOrDefault(x => x.EntityConfig == baseConfig)?.TypeBuilder;
                }
            }

            baseType = baseType ?? typeof(FullPowerEntity);

            // Base class info
            var typeBuilder = moduleBuilder.DefineType($"{moduleBuilder.Assembly.GetName().Name}.{entityConfig.ClassName}",
                    TypeAttributes.Public |
                    TypeAttributes.Class |
                    TypeAttributes.AutoClass |
                    TypeAttributes.AnsiClass |
                    TypeAttributes.BeforeFieldInit |
                    TypeAttributes.AutoLayout,
                    baseType,
                    new Type[] { typeof(IEntity<Guid>) });

            // Class Attributes
            // Set Table
            var tableAttribute = typeof(TableAttribute).GetConstructor(new Type[] { typeof(string) });
            var tableAttributeBuilder = new CustomAttributeBuilder(tableAttribute.NotNull(), new object[] { $"dynamic.{entityConfig.TableName.NotNull()}" });
            typeBuilder.SetCustomAttribute(tableAttributeBuilder);

            // Set Discriminator
            var discriminatorAttribute = typeof(DiscriminatorValueAttribute).GetConstructor(new Type[] { typeof(string) });
            var discriminatorAttributeBuilder = new CustomAttributeBuilder(discriminatorAttribute.NotNull(), new object[] { entityConfig.DiscriminatorValue.NotNull() });
            typeBuilder.SetCustomAttribute(discriminatorAttributeBuilder);

            var typeBuilderType = new EntityTypeBuilderType()
            {
                EntityConfig = entityConfig,
                Type = null,
                TypeBuilder = typeBuilder,
            };
            context.Types.Add(typeBuilderType);

            return typeBuilderType;
        }

        // ToDo: AS - remove after implementation
        /*public Type CreateType(ModuleBuilder moduleBuilder, EntityConfig entityConfig, List<EntityProperty>? properties, EntityTypeBuilderContext context)
        {
            // ToDo: AS - remove logging
            _logger.Warn($"DynamicEntityTypeBuilder: CreateType - {entityConfig.Accessor}");

            var typeBuilderType =
                context.Types.FirstOrDefault(x => x.EntityConfig == entityConfig)
                ?? CreateTypeBuilder(moduleBuilder, entityConfig, context);

            var existProperties = typeBuilderType.TypeBuilder.GetProperties();

            // Class properties
            if (properties != null)
            {
                foreach (var property in properties.Where(x => x.Name != "Id" && !existProperties.Any(y => y.Name == x.Name)))
                {
                    var propType = GetDtoPropertyType(property, context);
                    if (propType != null)
                        CreateProperty(typeBuilderType.TypeBuilder, property.Name, propType);
                }
            }

            var type = typeBuilderType.TypeBuilder.CreateType();
            typeBuilderType.Type = type;
            return type;
        }*/

        public Type CreateType(EntityTypeBuilderType typeBuilderType, List<EntityProperty>? properties, EntityTypeBuilderContext context)
        {
            // ToDo: AS - remove logging
            _logger.Warn($"DynamicEntityTypeBuilder: CreateType (typeBuilderType) - {typeBuilderType.TypeBuilder.FullName}");

            // Class properties
            if (properties != null)
            {
                var existProperties = typeBuilderType.TypeBuilder.BaseType?.GetProperties();
                var propertiesToAdd = properties.Where(x => x.Name != "Id" && (!existProperties?.Any(y => y.Name == x.Name) ?? true));
                foreach (var property in propertiesToAdd)
                {
                    var propType = GetDtoPropertyType(property, context);
                    if (propType != null)
                        CreateProperty(typeBuilderType.TypeBuilder, property, propType);
                }
            }

            var type = typeBuilderType.TypeBuilder.CreateType();
            typeBuilderType.Type = type;
            return type;
        }

        public static void CreateProperty(TypeBuilder tb, EntityProperty property, Type propertyType)
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

            // Set ColumnName to avoid incorrect mapping
            var columnAttribute = typeof(ColumnAttribute).GetConstructor([typeof(string)]);
            var columnAttributeBuilder = new CustomAttributeBuilder(columnAttribute.NotNull(), new [] { property.ColumnName });
            propertyBuilder.SetCustomAttribute(columnAttributeBuilder);
        }

        /// <summary>
        /// Returns .Net type that is used to store data for the specified DTO property (according to the property settings)
        /// </summary>
        public /*async Task<Type>*/ Type? GetDtoPropertyType/*Async*/(EntityProperty property, EntityTypeBuilderContext context)//, DynamicDtoTypeBuildingContext context)
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
                    // todo: find a way to check an entity property
                    // if it's declared as an enum - get base type of this enum
                    // if it's declared as int/Int64 - use this type
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
                    if (property.EntityType.IsNullOrWhiteSpace())
                        return typeof(GenericEntityReference);
                    else
                        return GetEntityReferenceType(property, context);
                case DataTypes.File:
                    return typeof(StoredFile);

                case DataTypes.Object:
                    // ToDo: AS - check if `object` type is enough
                    return typeof(object); //await GetNestedTypeAsync(property, context); // JSON content

                case DataTypes.ObjectReference:
                    return typeof(object);


                /*case DataTypes.Array:
                    if (property.ItemsType != null)
                    {
                        var nestedType = await GetDtoPropertyTypeAsync(property.ItemsType, context);
                        var arrayType = typeof(List<>).MakeGenericType(nestedType.NotNull());
                        return arrayType;
                    }
                    if (property.DataFormat == ArrayFormats.ObjectReference)
                    {
                        var arrayType = typeof(List<>).MakeGenericType(typeof(object));
                        return arrayType;
                    }
                    return null;*/
                default:
                    return null;
                    throw new NotSupportedException($"Data type not supported: {dataType}");
            }
        }

        private Type GetEntityReferenceType(EntityProperty property, EntityTypeBuilderContext context)//, DynamicDtoTypeBuildingContext context)
        {
            if (property.DataType != DataTypes.EntityReference)
                throw new NotSupportedException($"DataType {property.DataType} is not supported. Expected {DataTypes.EntityReference}");

            if (string.IsNullOrWhiteSpace(property.EntityType))
                throw new EntityTypeNotFoundException(property.EntityType ?? "");

            var refType = context.Types.FirstOrDefault(x => x.EntityConfig.FullClassName == property.EntityType);

            var entityType = refType?.Type ?? refType?.TypeBuilder
                ?? context.EntityConfigurationStore.GetOrNull(property.EntityType)?.EntityType // try to find in the EntityConfigurationStore by ClassName and TypeShortAlias
                ?? _typeFinder.Find(x => x.FullName == property.EntityType).FirstOrDefault();
            if (entityType == null)
                throw new EntityTypeNotFoundException(property.EntityType.NotNull());
            return entityType;

            //return typeof(Nullable<>).MakeGenericType(entityType);
        }
    }
}
