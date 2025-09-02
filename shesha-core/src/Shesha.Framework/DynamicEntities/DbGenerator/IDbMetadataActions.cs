using System.Threading.Tasks;

namespace Shesha.DynamicEntities.DbGenerator
{
    public interface IDbMetadataActions
    {
        string? CurrentSchema { get; }
        string? CurrentTable { get; }
        string? CurrentColumn { get; }

        bool IsSchemaCreated { get; }
        bool IsTableCreated { get; }
        bool IsColumnCreated { get; }

        Task<bool> IsSchemaExistsAsync(string schemaName);
        Task<bool> IsTableExistsAsync(string tableName);
        Task<bool> IsColumnExistsAsync(string columnName);

        Task<IDbMetadataActions> UseSchemaAsync(string schemaName, bool created = false);
        Task<IDbMetadataActions> UseTableAsync(string tableName, bool created = false);

        Task<IDbMetadataActions> CreateSchemaAsync(string schemaName);
        Task<IDbMetadataActions> CreateTableAsync(string tableName);
        Task<IDbMetadataActions> CreateManyToManyTableAsync(
            string tableName,
            string primaryTableName, string foreignTableName,
            string primaryIdName, string foreignIdName,
            string keyColumnName, string foreignColumnName
        );

        Task<IDbMetadataActions> CreateColumnAsync(string columnName, DbColumnTypeEnum type, bool indexed = false);
        Task<IDbMetadataActions> CreateColumnAsync(string columnName, DbColumnType type, bool indexed = false);
        Task<IDbMetadataActions> CreateEntityReferenceColumnAsync(string columnName, string primaryTableName, string primaryColumnName);
        Task<IDbMetadataActions> CreateIndexAsync(string[] columns);

        //Task<IDbMetadataActions> CreateManyToManyTableAsync(string leftTableName, string leftColumnName, string rightTableName, string rightColumnName);

        Task<DbColumnTypeEnum> GetColumnTypeAsync(string name);

        //Task<DbColumnTypeEnum> GetColumnTypeForPropertyAsync(EntityPropertyDto entityProperty);
        //Task<string> GetTableNameAsync(string className, string classNamespace, Module? module);
        //Task<string> GetTableNameAsync(EntityConfigDto entityConfig);
        //Task<string> GetColumnNameAsync(EntityPropertyDto entityProperty);

    }
}
