using Shesha.Domain;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.DynamicEntities.Dtos;
using System.Threading.Tasks;

namespace Shesha.DbActions
{
    public class DbPostgreMetadataActions : IDbMetadataActions
    {
        public string? CurrentSchema => throw new System.NotImplementedException();

        public string? CurrentTable => throw new System.NotImplementedException();

        public string? CurrentColumn => throw new System.NotImplementedException();

        public bool IsSchemaCreated => throw new System.NotImplementedException();

        public bool IsTableCreated => throw new System.NotImplementedException();

        public bool IsColumnCreated => throw new System.NotImplementedException();

        public void CreateColumn(string tableName, string name, DbColumnTypeEnum type, bool indexed = false)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateColumnAsync(string columnName, DbColumnTypeEnum type, bool indexed = false)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateColumnAsync(string columnName, DbColumnType type, bool indexed = false)
        {
            throw new System.NotImplementedException();
        }

        public void CreateEntityReferenceColumn(string tableName,string name, string primaryTableName, string primaryColumnName)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateEntityReferenceColumnAsync(string columnName, string primaryTableName, string primaryColumnName)
        {
            throw new System.NotImplementedException();
        }

        public void CreateIndex(string tableName, string[] columns)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateIndexAsync(string[] columns)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateManyToManyTableAsync(string tableName, string primaryTableName, string foreignTableName, string primaryIdName, string foreignIdName, string keyColumnName, string foreignColumnName)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateSchemaAsync(string schemaName)
        {
            throw new System.NotImplementedException();
        }

        public void CreateTable(string tableName)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> CreateTableAsync(string tableName)
        {
            throw new System.NotImplementedException();
        }

        public string GetColumnName(EntityPropertyDto entityProperty)
        {
            throw new System.NotImplementedException();
        }

        public DbColumnTypeEnum GetColumnType(string name)
        {
            throw new System.NotImplementedException();
        }

        public Task<DbColumnTypeEnum> GetColumnTypeAsync(string name)
        {
            throw new System.NotImplementedException();
        }

        public DbColumnTypeEnum GetColumnTypeForProperty(EntityPropertyDto entityProperty)
        {
            throw new System.NotImplementedException();
        }

        public string GetTableName(string className, string classNamespace, Module? module)
        {
            throw new System.NotImplementedException();
        }

        public string GetTableName(EntityConfigDto entityConfig)
        {
            throw new System.NotImplementedException();
        }

        public bool IsColumnExist(string name)
        {
            throw new System.NotImplementedException();
        }

        public Task<bool> IsColumnExistsAsync(string columnName)
        {
            throw new System.NotImplementedException();
        }

        public Task<bool> IsSchemaExistsAsync(string schemaName)
        {
            throw new System.NotImplementedException();
        }

        public bool IsTableExist(string name)
        {
            throw new System.NotImplementedException();
        }

        public Task<bool> IsTableExistsAsync(string tableName)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> UseSchemaAsync(string schemaName, bool created = false)
        {
            throw new System.NotImplementedException();
        }

        public Task<IDbMetadataActions> UseTableAsync(string tableName, bool created = false)
        {
            throw new System.NotImplementedException();
        }
    }
}
