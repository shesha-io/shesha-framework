using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Shesha.Domain;
using Shesha.Domain.EntityPropertyConfiguration;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Enums;
using Shesha.DynamicEntities.ErrorHandler;
using Shesha.Extensions;
using Shesha.Generators;
using Shesha.Metadata;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.DbGenerator
{
    public class DynamicEntitiesDbGenerator : IDynamicEntitiesDbGenerator, ITransientDependency
    {
        private readonly IDbMetadataActions _dbActions;
        private readonly IEntityConfigCache _entityConfigCache;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly INameGenerator _nameGenerator;

        public DynamicEntitiesDbGenerator(
            IDbMetadataActions dbActions,
            IEntityConfigCache entityConfigCache,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            INameGenerator nameGenerator
        )
        {
            _dbActions = dbActions;
            _entityConfigCache = entityConfigCache;
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _nameGenerator = nameGenerator;
        }

        private async Task UpdateSuccessAsync(EntityConfig config)
        {
            config.CreatedInDb = true;
            config.InitStatus &= ~EntityInitFlags.DbActionRequired;
            config.InitStatus &= ~EntityInitFlags.DbActionFailed;
            config.InitMessage = "";
            await _entityConfigRepository.UpdateAsync(config);
        }
        private async Task UpdateSuccessAsync(EntityProperty property)
        {
            property.CreatedInDb = true;
            property.InitStatus &= ~EntityInitFlags.DbActionRequired;
            property.InitStatus &= ~EntityInitFlags.DbActionFailed;
            property.InitMessage = "";
            await _entityPropertyRepository.UpdateAsync(property);
        }

        private async Task<bool> UseSchemaAndTableAsync(EntityConfig entityConfig)
        {
            var tableName = entityConfig.TableName.NotNull();
            var baseConfig = entityConfig;
            while (baseConfig.InheritedFrom != null)
            {
                baseConfig = baseConfig.InheritedFrom;
            }
            await UseSchemaAsync(entityConfig.SchemaName ?? "");
            return await UseTableAsync(tableName);
        }

        public async Task ProcessEntityConfigAsync(EntityConfig entityConfig, List<EntityProperty>? properties = null)
        {
            try
            {
                // Get force to skip exist checks for new tables
                var force = await UseSchemaAndTableAsync(entityConfig);

                var props = await _entityPropertyRepository.GetAll()
                    .Where(x =>
                        x.EntityConfig.Id == entityConfig.Id
                        && x.InitStatus.HasFlag(EntityInitFlags.DbActionRequired)
                        && x.ParentProperty == null)
                    .ToListAsync();

                foreach (var property in props)
                {
                    try
                    {
                        if (property.IsFrameworkRelated)
                            // Framework related properties should be created by UseSchemaAndTableAsync function executed above
                            await UpdateSuccessAsync(property);
                        else
                            await ProcessEntityPropertyAsync(property, force);
                    }
                    catch (Exception e)
                    {
                        throw new EntityPropertyDbInitializationException(property, e, "DB initialization");
                    }
                }

                await UpdateSuccessAsync(entityConfig);
            }
            catch (Exception e)
            {
                throw new EntityDbInitializationException(entityConfig, e, "DB initialization");
            }
        }

        public async Task ProcessEntityPropertyAsync(EntityProperty entityProperty, bool force = false)
        {
            if (entityProperty.InheritedFrom != null && !entityProperty.InheritedFrom.IsDeleted)
            {
                await UpdateSuccessAsync(entityProperty);
                return;
            }

            await UseSchemaAndTableAsync(entityProperty.EntityConfig);

            var propertyDbType = GetDbColumnType(entityProperty);
            var columnName = entityProperty.ColumnName.NotNull($"Column name for property {entityProperty.Name} of {entityProperty.EntityConfig.FullClassName} should not be null");

            // Create many to many table
            if (entityProperty.DataType == DataTypes.Array && entityProperty.DataFormat == ArrayFormats.ManyToManyEntities)
            {
                // if user defined type then use "dynamic" DB schema otherwise use main DB schema
                //var schema = entityProperty.Source == Domain.Enums.MetadataSourceType.UserDefined ? "dynamic_ref" : "ref";
                var schema = entityProperty.EntityConfig.SchemaName ?? "";
                await UseSchemaAsync(schema);
                var tableName = entityProperty.ListConfiguration?.DbMapping?.ManyToManyTableName;
                var refConfig = (await _entityConfigCache.GetDynamicSafeEntityConfigAsync(entityProperty.EntityFullClassName.NotNull())).NotNull();
                var create = true;
                if (tableName.IsNullOrEmpty())
                {
                    entityProperty.ListConfiguration = entityProperty.ListConfiguration ?? new EntityPropertyListConfiguration() { MappingType = EntityPropertyListConfiguration.ManyToMany };
                    entityProperty.ListConfiguration.DbMapping = entityProperty.ListConfiguration.DbMapping ?? new EntityPropertyListDbMapping();

                    if (!(entityProperty.ListConfiguration.ForeignProperty).IsNullOrEmpty())
                    {
                        var refProperties = (await _entityConfigCache.GetDynamicSafeEntityPropertiesAsync(entityProperty.EntityFullClassName.NotNull())).NotNull();
                        var refProp = refProperties.FirstOrDefault(x => x.Name.ToCamelCase() == entityProperty.ListConfiguration.ForeignProperty.ToCamelCase());
                        if (!(refProp?.ListConfiguration?.DbMapping?.ManyToManyTableName).IsNullOrEmpty())
                        {
                            entityProperty.ListConfiguration.DbMapping.ManyToManyTableName = refProp?.ListConfiguration?.DbMapping?.ManyToManyTableName;
                            entityProperty.ListConfiguration.DbMapping.ManyToManyKeyColumnName = refProp?.ListConfiguration?.DbMapping?.ManyToManyChildColumnName;
                            entityProperty.ListConfiguration.DbMapping.ManyToManyChildColumnName = refProp?.ListConfiguration?.DbMapping?.ManyToManyKeyColumnName;
                            create = false;
                        }
                    }

                    if (create)
                    {
                        // ToDo: AS - use naming generator
                        tableName = $"{entityProperty.EntityConfig.TableName}_{refConfig.TableName}";
                        var index = 1;
                        var numberTableName = $"{tableName}_{index++}";
                        while (await _dbActions.IsTableExistsAsync(numberTableName))
                        {
                            numberTableName = $"{tableName}_{index++}";
                        }
                        tableName = numberTableName;

                        // ToDo: AS - get Id Column and naming generator
                        entityProperty.ListConfiguration.DbMapping.ManyToManyTableName = string.IsNullOrEmpty(schema) ? tableName : $"{schema}.{tableName}";
                        entityProperty.ListConfiguration.DbMapping.ManyToManyKeyColumnName = $"{columnName}_id";
                        entityProperty.ListConfiguration.DbMapping.ManyToManyChildColumnName = $"{refConfig.TableName}_id";
                    }
                }

                if (create)
                {
                    var dbMapping = entityProperty.ListConfiguration?.DbMapping.NotNull();
                    var primarySchema = entityProperty.EntityConfig.SchemaName.IsNullOrEmpty() ? "" : $"{entityProperty.EntityConfig.SchemaName}.";
                    var primaryTable = $"{primarySchema}{entityProperty.EntityConfig.TableName}";
                    var foreignSchema = refConfig.SchemaName.IsNullOrEmpty() ? "" : $"{refConfig.SchemaName}.";
                    var foreignTable = $"{foreignSchema}{refConfig.TableName}";

                    await _dbActions.CreateManyToManyTableAsync(
                        (dbMapping?.ManyToManyTableName).NotNull(),
                        primaryTable.NotNull(), foreignTable.NotNull(),
                        "id", "id", // ToDo: AS - get Id Column
                        (dbMapping?.ManyToManyKeyColumnName).NotNull(), (dbMapping?.ManyToManyChildColumnName).NotNull()
                    );
                }

                await UpdateSuccessAsync(entityProperty);
                await UpdateInheritedProperttiesAsync(entityProperty);
                return;
            }

            // Ignore for some property type (eg. arrays with many to many relationship)
            if (propertyDbType == null)
                return;

            // Create column
            if (propertyDbType.ColumnType == DbColumnTypeEnum.EntityReference)
            {
                // ToDo: AS - check column type
                if (force || !await _dbActions.IsColumnExistsAsync(columnName))
                {
                    var referenceConfig = (await _entityConfigCache.GetDynamicSafeEntityConfigAsync(
                        entityProperty.DataType == DataTypes.File
                            ? typeof(StoredFile).FullName.NotNull()
                            : entityProperty.EntityFullClassName.NotNull()
                    )).NotNull();
                    var primarySchema = entityProperty.DataType == DataTypes.File
                        ? MappingHelper.GetSchemaName(typeof(StoredFile))
                        : referenceConfig?.SchemaName;
                    var primaryTable = entityProperty.DataType == DataTypes.File
                        ? MappingHelper.GetTableName(typeof(StoredFile))
                        : referenceConfig?.TableName.NotNull();
                    primaryTable = primarySchema.IsNullOrEmpty()
                        ? primaryTable
                        : $"{primarySchema}.{primaryTable}";
                    await _dbActions.CreateEntityReferenceColumnAsync($"{columnName}", primaryTable.NotNull(), "id"); // ToDo: AS - get Id Column
                }

                await UpdateSuccessAsync(entityProperty);
                await UpdateInheritedProperttiesAsync(entityProperty);
                return;
            }
            // ToDo: AS - get Id Column and naming generator
            if (propertyDbType.ColumnType == DbColumnTypeEnum.GenericEntityReference) 
            {
                // ToDo: AS - check columns type
                if (force || !await _dbActions.IsColumnExistsAsync($"{columnName}_id")) // ToDo: AS - get Id Column
                    await _dbActions.CreateColumnAsync($"{columnName}_id", new DbColumnType(DbColumnTypeEnum.String, 100));
                if (force || !await _dbActions.IsColumnExistsAsync($"{columnName}_class_name"))
                    await _dbActions.CreateColumnAsync($"{columnName}_class_name", new DbColumnType(DbColumnTypeEnum.String, 1000));
                if (force || !await _dbActions.IsColumnExistsAsync($"{columnName}_display_name"))
                    await _dbActions.CreateColumnAsync($"{columnName}_display_name", new DbColumnType(DbColumnTypeEnum.String));
                await UpdateSuccessAsync(entityProperty);
                await UpdateInheritedProperttiesAsync(entityProperty);
                return;
            }
            if (force || !await _dbActions.IsColumnExistsAsync(columnName))
            {
                await _dbActions.CreateColumnAsync(columnName, propertyDbType);

                await UpdateSuccessAsync(entityProperty);
                await UpdateInheritedProperttiesAsync(entityProperty);
                return;
            }

            // Column exists
            // Check column type
            // ToDo: AS - Check column if exists
            /*var columnDbType = await _dbActions.GetColumnTypeAsync(columnName);
            if (columnDbType != propertyDbType)
            {
                // Types are not the same

            }*/

            await UpdateSuccessAsync(entityProperty);
            await UpdateInheritedProperttiesAsync(entityProperty);
            return;

        }

        private async Task UpdateInheritedProperttiesAsync(EntityProperty property)
        {
            var inheritedProps = await _entityPropertyRepository.GetAll().Where(x => x.InheritedFrom == property).ToListAsync();

            foreach (var inheritedProp in inheritedProps)
            {
                inheritedProp.ListConfiguration = inheritedProp.ListConfiguration ?? new EntityPropertyListConfiguration();
                inheritedProp.ListConfiguration.DbMapping = inheritedProp.ListConfiguration.DbMapping ?? new EntityPropertyListDbMapping();

                inheritedProp.ListConfiguration.DbMapping.ManyToManyTableName = property.ListConfiguration?.DbMapping?.ManyToManyTableName;
                inheritedProp.ListConfiguration.DbMapping.ManyToManyKeyColumnName = property.ListConfiguration?.DbMapping?.ManyToManyKeyColumnName;
                inheritedProp.ListConfiguration.DbMapping.ManyToManyChildColumnName = property.ListConfiguration?.DbMapping?.ManyToManyChildColumnName;
                inheritedProp.ListConfiguration.DbMapping.ManyToManyInversePropertyName = property.ListConfiguration?.DbMapping?.ManyToManyInversePropertyName;

                inheritedProp.ListConfiguration.MappingType = property.ListConfiguration?.MappingType;
                inheritedProp.ListConfiguration.ForeignProperty = property.ListConfiguration?.ForeignProperty;

                inheritedProp.ColumnName = property.ColumnName;
                inheritedProp.CreatedInDb = property.CreatedInDb;
                inheritedProp.InitStatus = property.InitStatus;
                inheritedProp.InitMessage = property.InitMessage;

                // Update all flags just in case
                await UpdateSuccessAsync(inheritedProp);
            }
        }

        private async Task<IDbMetadataActions> UseSchemaAsync(string schemaName)
        {
            if (schemaName == "")
                await _dbActions.UseSchemaAsync("");
            else if (!await _dbActions.IsSchemaExistsAsync(schemaName))
                await _dbActions.CreateSchemaAsync(schemaName);
            else
                await _dbActions.UseSchemaAsync(schemaName);

            return _dbActions;
        }

        private async Task<bool> UseTableAsync(string tableName)
        {
            if (!await _dbActions.IsTableExistsAsync(tableName))
            {
                await _dbActions.CreateTableAsync(tableName);
                return true;
            }
            else
            {
                await _dbActions.UseTableAsync(tableName);
                return false;
            }
        }

        private DbColumnType? GetDbColumnType(EntityProperty entityProperty)
        {

            switch (entityProperty.DataType)
            {
                case DataTypes.Guid: return new DbColumnType(DbColumnTypeEnum.Guid);
                case DataTypes.String: return new DbColumnType(DbColumnTypeEnum.String);
                case DataTypes.Number:
                    switch (entityProperty.DataFormat)
                    {
                        case NumberFormats.Float: return new DbColumnType(DbColumnTypeEnum.Float);
                        case NumberFormats.Double: return new DbColumnType(DbColumnTypeEnum.Double);
                        case NumberFormats.Int32: return new DbColumnType(DbColumnTypeEnum.Int32);
                        case NumberFormats.Int64: return new DbColumnType(DbColumnTypeEnum.Int64);
                        case NumberFormats.Decimal:
                            var formatting = entityProperty.Formatting?.ToObject<EntityPropertyNumberFormatting>();
                            return new DbColumnType(DbColumnTypeEnum.Decimal, formatting?.NumDecimalPlaces ?? 0);
                    }
                    break;
                case DataTypes.Date: return new DbColumnType(DbColumnTypeEnum.Date);
                case DataTypes.Time: return new DbColumnType(DbColumnTypeEnum.Time);
                case DataTypes.DateTime: return new DbColumnType(DbColumnTypeEnum.DateTime);
                case DataTypes.EntityReference:
                    return entityProperty.DataFormat == EntityFormats.GenericEntity
                    ? new DbColumnType(DbColumnTypeEnum.GenericEntityReference)
                    : new DbColumnType(DbColumnTypeEnum.EntityReference);
                case DataTypes.File: return new DbColumnType(DbColumnTypeEnum.EntityReference);
                case DataTypes.ReferenceListItem: return new DbColumnType(DbColumnTypeEnum.ReferenceListItem);
                case DataTypes.Boolean: return new DbColumnType(DbColumnTypeEnum.Boolean);
                case DataTypes.Array:
                    switch (entityProperty.DataFormat)
                    {
                        case ArrayFormats.ChildObjects: return new DbColumnType(DbColumnTypeEnum.String);
                        case ArrayFormats.Simple: return new DbColumnType(DbColumnTypeEnum.String);
                        case ArrayFormats.MultivalueReferenceList: return new DbColumnType(DbColumnTypeEnum.Int64);
                        default: return null;
                    }
                case DataTypes.Object: return new DbColumnType(DbColumnTypeEnum.String);
                case DataTypes.Geometry: throw new NotImplementedException();
            }

            return null;
        }
    }
}
