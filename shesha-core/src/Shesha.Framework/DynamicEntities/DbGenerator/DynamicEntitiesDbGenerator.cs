using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Shesha.Domain;
using Shesha.DynamicEntities.Cache;
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

        public DynamicEntitiesDbGenerator(
            IDbMetadataActions dbActions,
            IEntityConfigCache entityConfigCache,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository
        )
        {
            _dbActions = dbActions;
            _entityConfigCache = entityConfigCache;
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
        }

        private async Task<bool> UseSchemaAndTableAsync(EntityConfig entityConfig)
        {
            var tableName = entityConfig.TableName.NotNull();
            var baseConfig = entityConfig;
            while (baseConfig.InheritedFrom != null)
            {
                baseConfig = baseConfig.InheritedFrom;
            }
            // if user defined type then use "dynamic" DB schema otherwise use main DB schema
            await UseSchemaAsync(baseConfig.Source == Domain.Enums.MetadataSourceType.UserDefined ? "dynamic" : "");
            return await UseTableAsync(tableName);
        }

        public async Task ProcessEntityConfigAsync(EntityConfig entityConfig, List<EntityProperty>? properties = null)
        {
            // Force to skip exist checks for new tables
            var force = await UseSchemaAndTableAsync(entityConfig);

            var props = properties ?? _entityPropertyRepository.GetAll().Where(x => x.EntityConfig == entityConfig).ToList();
            if (props != null)
            {
                foreach (var property in props.Where(x => !x.CreatedInDb))
                {
                    await ProcessEntityPropertyAsync(property, force);
                }
            }

            entityConfig.CreatedInDb = true;
            await _entityConfigRepository.UpdateAsync(entityConfig);
        }

        public async Task ProcessEntityPropertyAsync(EntityProperty entityProperty)
        {
            await UseSchemaAndTableAsync(entityProperty.EntityConfig);
            await ProcessEntityPropertyAsync(entityProperty, false);
        }

        private async Task ProcessEntityPropertyAsync(EntityProperty entityProperty, bool force)
        {
            var columnName = entityProperty.ColumnName.NotNull();// ?? _dbActions.GetColumnName(entityProperty);

            var propertyDbType = GetDbColumnType(entityProperty);// await _dbActions.GetColumnTypeForPropertyAsync(entityProperty);

            // Create column
            if (propertyDbType == DbColumnTypeEnum.EntityReference && (force || !await _dbActions.IsColumnExistsAsync(columnName)))
            {
                var referenceConfig = await _entityConfigCache.GetDynamicSafeEntityConfigAsync(
                    entityProperty.DataType == DataTypes.File
                        ? typeof(StoredFile).FullName.NotNull()
                        : entityProperty.EntityType.NotNull()
                );
                var primaryTable = entityProperty.DataType == DataTypes.File
                    ? MappingHelper.GetTableName(typeof(StoredFile))
                    : referenceConfig?.TableName.NotNull();
                await _dbActions.CreateEntityReferenceColumnAsync($"{columnName}", primaryTable.NotNull(), "Id"); // ToDo: AS - get Id Column
                entityProperty.CreatedInDb = true;
                await _entityPropertyRepository.UpdateAsync(entityProperty);
                return;
            }
            if (propertyDbType == DbColumnTypeEnum.GenericEntityReference && (force || !await _dbActions.IsColumnExistsAsync($"{columnName}Id")))
            {
                await _dbActions.CreateColumnAsync($"{columnName}Id", DbColumnTypeEnum.String);
                await _dbActions.CreateColumnAsync($"{columnName}ClassName", DbColumnTypeEnum.String);
                await _dbActions.CreateColumnAsync($"{columnName}DisplayName", DbColumnTypeEnum.String);
                entityProperty.CreatedInDb = true;
                await _entityPropertyRepository.UpdateAsync(entityProperty);
                return;
            }
            if (force || !await _dbActions.IsColumnExistsAsync(columnName))
            {
                await _dbActions.CreateColumnAsync(columnName, propertyDbType);
                entityProperty.CreatedInDb = true;
                await _entityPropertyRepository.UpdateAsync(entityProperty);
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

            entityProperty.CreatedInDb = true;
            await _entityPropertyRepository.UpdateAsync(entityProperty);
            return;

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

        private DbColumnTypeEnum GetDbColumnType(EntityProperty entityProperty)
        {
            switch (entityProperty.DataType)
            {
                case "guid": return DbColumnTypeEnum.Guid;
                case "string": return DbColumnTypeEnum.String;
                case "number":
                    switch (entityProperty.DataFormat)
                    {
                        case "float": return DbColumnTypeEnum.Float;
                        case "double": return DbColumnTypeEnum.Double;
                        case "int32": return DbColumnTypeEnum.Int32;
                        case "int64": return DbColumnTypeEnum.Int64;
                    }
                    break;
                case "date": return DbColumnTypeEnum.Date;
                case "time": return DbColumnTypeEnum.Time;
                case "date-time": return DbColumnTypeEnum.DateTime;
                case "entity":
                    return entityProperty.EntityType.IsNullOrEmpty()
                    ? DbColumnTypeEnum.GenericEntityReference
                    : DbColumnTypeEnum.EntityReference;
                case "file": return DbColumnTypeEnum.EntityReference;
                case "reference-list-item": return DbColumnTypeEnum.ReferenceListItem;
                case "boolean": return DbColumnTypeEnum.Boolean;
                case "array": throw new NotImplementedException();
                case "object": throw new NotImplementedException();
                case "object-reference": throw new NotImplementedException();
                case "geometry": throw new NotImplementedException();
            }

            throw new NotImplementedException();
        }
    }
}
