using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.DbGenerator
{
    public abstract class BaseDbMetadataActions : IDbMetadataActions, ITransientDependency
    {
        protected readonly IUnitOfWorkManager _unitOfWorkManager;

        public string? CurrentSchema { get; internal set; } = null;
        public string? CurrentTable { get; internal set; } = null;
        public string? CurrentColumn { get; internal set; } = null;

        public bool IsSchemaCreated { get; internal set; }
        public bool IsTableCreated { get; internal set; }
        public bool IsColumnCreated { get; internal set; }

        public abstract string SchemaName { get; }

        public string TableName => SchemaName.IsNullOrEmpty() ? CurrentTable.NotNull("Table name should not be null") : $"{SchemaName}.{CurrentTable.NotNull("Table name should not be null")}";

        public BaseDbMetadataActions(
            IUnitOfWorkManager unitOfWorkManager
        )
        {
            _unitOfWorkManager = unitOfWorkManager;
        }

        // ToDO: AS V1 - use name conventions
        protected virtual string NC(string text)
        {
            return text.ToSnakeCase();
        }

        public virtual async Task<IDbMetadataActions> UseSchemaAsync(string schemaName, bool created = false)
        {
            IsSchemaCreated = created;
            IsTableCreated = false;
            IsColumnCreated = false;
            CurrentSchema = schemaName;
            CurrentTable = null;
            CurrentColumn = null;
            return await Task.FromResult(this);
        }

        public async Task<IDbMetadataActions> UseTableAsync(string tableName, bool created = false)
        {
            IsTableCreated = created;
            IsColumnCreated = false;
            CurrentTable = tableName;
            CurrentColumn = null;
            return await Task.FromResult(this);
        }

        private async Task<IDbMetadataActions> UseColumnAsync(string columnName, bool created = false)
        {
            IsColumnCreated = created;
            CurrentColumn = columnName;
            return await Task.FromResult(this);
        }

        public virtual Task CreateCurrentSchemaAsync()
        {
            throw new System.NotImplementedException();
        }

        public async Task<IDbMetadataActions> CreateSchemaAsync(string schemaName)
        {
            await UseSchemaAsync(schemaName, true);
            await CreateCurrentSchemaAsync();
            return this;
        }

        protected virtual Task CreateInternalManyToManyTableAsync(
            string tableName,
            string primaryTableName, string foreignTableName,
            string primaryIdName, string foreignIdName,
            string keyColumnName, string foreignColumnName
        )
        {
            throw new System.NotImplementedException();
        }

        public async Task<IDbMetadataActions> CreateManyToManyTableAsync(
            string tableName,
            string primaryTableName, string foreignTableName,
            string primaryIdName, string foreignIdName,
            string keyColumnName, string foreignColumnName
        )
        {
            await CreateInternalManyToManyTableAsync(tableName, primaryTableName, foreignTableName, primaryIdName, foreignIdName, keyColumnName, foreignColumnName);
            return this;
        }

        public virtual Task CreateCurrentTableAsync()
        {
            throw new System.NotImplementedException();
        }

        public async Task<IDbMetadataActions> CreateTableAsync(string tableName)
        {
            await UseTableAsync(tableName, true);
            await CreateCurrentTableAsync();
            return this;
        }

        public virtual Task CreateCurrentColumnAsync(DbColumnType type, bool indexed = false)
        {
            throw new System.NotImplementedException();
        }

        public async Task<IDbMetadataActions> CreateColumnAsync(string columnName, DbColumnTypeEnum type, bool indexed = false)
        {
            await CreateColumnAsync(columnName, new DbColumnType(type), indexed);
            return this;
        }

        public async Task<IDbMetadataActions> CreateColumnAsync(string columnName, DbColumnType type, bool indexed = false)
        {
            await UseColumnAsync(columnName, true);
            await CreateCurrentColumnAsync(type, indexed);
            return this;
        }

        public virtual Task CreateCurrentEntityReferenceColumnAsync(string primaryTableName, string primaryColumnName)
        {
            throw new System.NotImplementedException();
        }

        public async Task<IDbMetadataActions> CreateEntityReferenceColumnAsync(string columnName, string primaryTableName, string primaryColumnName)
        {
            await UseColumnAsync(columnName, true);
            await CreateCurrentEntityReferenceColumnAsync(primaryTableName, primaryColumnName);
            return this;
        }

        public virtual Task<IDbMetadataActions> CreateIndexAsync(string[] columns)
        {
            throw new System.NotImplementedException();
        }

        public virtual Task<DbColumnTypeEnum> GetColumnTypeAsync(string name)
        {
            throw new System.NotImplementedException();
        }

        public virtual Task<bool> IsSchemaExistsAsync(string schemaName)
        {
            throw new System.NotImplementedException();
        }

        public virtual Task<bool> IsTableExistsAsync(string tableName)
        {
            throw new System.NotImplementedException();
        }

        public virtual Task<bool> IsColumnExistsAsync(string columnName)
        {
            throw new System.NotImplementedException();
        }
    }
}
