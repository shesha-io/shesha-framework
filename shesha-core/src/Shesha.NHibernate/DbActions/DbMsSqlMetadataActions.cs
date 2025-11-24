using Abp.Collections.Extensions;
using Abp.Domain.Uow;
using NHibernate;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.NHibernate.UoW;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DbActions
{
    public class DbMsSqlGenerateActions : BaseDbMetadataActions
    {
        public override string SchemaName => CurrentSchema.IsNullOrEmpty() ? "dbo" : CurrentSchema.NotNull();
        public override string TableName => SchemaName.IsNullOrEmpty() 
            ? $"[{CurrentTable.NotNull("Table name should not be null")}]" 
            : $"[{SchemaName}].[{CurrentTable.NotNull("Table name should not be null")}]";

        public DbMsSqlGenerateActions(
            IUnitOfWorkManager unitOfWorkManager
        ): base(unitOfWorkManager)
        {
        }

        public override async Task<bool> IsSchemaExistsAsync(string schemaName)
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            var result = await session
                .CreateSQLQuery($"SELECT 1 FROM sys.schemas WHERE name = '{schemaName}'")
                .ListAsync<int>();
            return result.Count > 0;
        }

        public override async Task<bool> IsTableExistsAsync(string tableName)
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            var result = await session
                .CreateSQLQuery($"SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '{SchemaName}' AND  TABLE_NAME = '{tableName}'")
                .ListAsync<int>();
            return result.Count > 0;
        }

        public override async Task<bool> IsColumnExistsAsync(string columnName)
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            var result = await session
                .CreateSQLQuery($"SELECT 1 FROM sys.columns WHERE Name = N'{columnName}' AND Object_ID = Object_ID(N'{TableName}')")
                .ListAsync<int>();
            return result.Count > 0;
        }

        public override async Task CreateCurrentSchemaAsync()
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            await session
                .CreateSQLQuery($"EXEC('CREATE SCHEMA {CurrentSchema}')")
                .ExecuteUpdateAsync();
        }

        private (string? schema, string table, string schemaTable, string snakedSchemaTable) ParseTableName(string tableName)
        {
            var unbracked = tableName.Replace("[", "").Replace("]", "");
            var names = unbracked.Split(".");

            if (names.Length > 2)
                throw new ArgumentException($"Invalid table name format: {tableName}. Expected 'table' or 'schema.table'");

            var schema = names.Length == 1 ? null : names[0];
            var table = names.Length == 1 ? names[0] : names[1];

            if (string.IsNullOrWhiteSpace(table))
                throw new ArgumentException($"Invalid table name format: {tableName}. Table name cannot be empty.");
            if (schema != null && string.IsNullOrWhiteSpace(schema))
                throw new ArgumentException($"Invalid table name format: {tableName}. Schema name cannot be empty or use 'table' format (without 'schema.').");

            return (
                schema,
                table,
                schema == null ? $"[{table}]" : $"[{schema}].[{table}]",
                unbracked.Replace(".", "_")
            );
        }

        protected override async Task CreateInternalManyToManyTableAsync(
            string tableName,
            string primaryTableName, string foreignTableName,
            string primaryIdName, string foreignIdName,
            string keyColumnName, string foreignColumnName
            )
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");

            var (_, table, schemaTable, _) = ParseTableName(tableName);
            var (_, _, primarySchemaTable, snakedPrimarySchemaTable) = ParseTableName(primaryTableName);
            var (_, _, foreignSchemaTable, snakedForeignSchemaTable) = ParseTableName(foreignTableName);

            await session
                .CreateSQLQuery(@$"CREATE TABLE {schemaTable} ([{keyColumnName}] [uniqueidentifier] NOT NULL, [{foreignColumnName}] [uniqueidentifier] NOT NULL)")
                .ExecuteUpdateAsync();

            await session
                .CreateSQLQuery($@"
ALTER TABLE {schemaTable} WITH CHECK ADD CONSTRAINT [FK_{table}_{keyColumnName}_{snakedPrimarySchemaTable}] 
FOREIGN KEY([{keyColumnName}]) REFERENCES {primarySchemaTable} ([{primaryIdName}])")
                .ExecuteUpdateAsync();

            await session
                .CreateSQLQuery($@"
ALTER TABLE {schemaTable} WITH CHECK ADD CONSTRAINT [FK_{table}_{foreignColumnName}_{snakedForeignSchemaTable}] 
FOREIGN KEY([{foreignColumnName}]) REFERENCES {foreignSchemaTable} ([{foreignIdName}])")
                .ExecuteUpdateAsync();
        }

        public override async Task CreateCurrentTableAsync()
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");

            await session
                .CreateSQLQuery(@$"
CREATE TABLE {TableName} (
[{NC("Id")}] [uniqueidentifier] NOT NULL,
[{NC("CreationTime")}] [datetime] NOT NULL,
[{NC("CreatorUserId")}] [bigint] NULL,
[{NC("LastModificationTime")}] [datetime] NULL,
[{NC("LastModifierUserId")}] [bigint] NULL,
[{NC("IsDeleted")}] [bit] NOT NULL,
[{NC("DeletionTime")}] [datetime] NULL,
[{NC("DeleterUserId")}] [bigint] NULL,
[{NC("Frwk_Discriminator")}] [nvarchar](100) NOT NULL,
[{NC("TenantId")}] [int] NULL,
CONSTRAINT PK_{CurrentTable} PRIMARY KEY CLUSTERED ({NC("Id")} ASC))")
                .ExecuteUpdateAsync();

            var (_, _, _, snakedSchemaTable) = ParseTableName(TableName);

            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD CONSTRAINT [{NC($"DF_{snakedSchemaTable}_CreationTime")}] DEFAULT (getdate()) FOR [{NC("CreationTime")}]")
                .ExecuteUpdateAsync();

            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD CONSTRAINT [{NC($"DF_{snakedSchemaTable}_IsDeleted")}] DEFAULT ((0)) FOR [{NC("IsDeleted")}]")
                .ExecuteUpdateAsync();
        }

        public override async Task CreateCurrentColumnAsync(DbColumnType type, bool indexed = false)
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD {CurrentColumn} {GetDBType(type)} Null")
                .ExecuteUpdateAsync();
        }

        public override async Task CreateCurrentEntityReferenceColumnAsync(string primaryTableName, string primaryColumnName)
        {
            var (_, _, _, snakedSchemaTable) = ParseTableName(TableName);
            var (_, _, primarySchemaTable, snakedPrimarySchemaTable) = ParseTableName(primaryTableName);

            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD {CurrentColumn} uniqueidentifier Null")
                .ExecuteUpdateAsync();
            await session
                .CreateSQLQuery($@"
ALTER TABLE {TableName} WITH CHECK ADD CONSTRAINT [{NC($"FK_{snakedSchemaTable}_{CurrentColumn}_{snakedPrimarySchemaTable}")}] 
FOREIGN KEY([{CurrentColumn}]) REFERENCES {primarySchemaTable} ({primaryColumnName})")
                .ExecuteUpdateAsync();
        }

        private string GetDBType(DbColumnType type)
        {
            // ToDo: AS - add geometry type
            switch (type.ColumnType)
            {
                case DbColumnTypeEnum.Guid: return "uniqueidentifier";
                case DbColumnTypeEnum.String: return $"nvarchar({(type.Size == null ? "max" : type.Size.ToString())})";
                case DbColumnTypeEnum.Decimal: return $"decimal(18, {(type.Size == null ? "0" : type.Size.ToString())})";
                case DbColumnTypeEnum.Double: return "float";
                case DbColumnTypeEnum.Float: return "float";
                case DbColumnTypeEnum.Int32: return "int";
                case DbColumnTypeEnum.Int64: return "bigint";
                case DbColumnTypeEnum.Boolean: return "bit";
                case DbColumnTypeEnum.Date: return "datetime";
                case DbColumnTypeEnum.Time: return "bigint";
                case DbColumnTypeEnum.DateTime: return "datetime";
                case DbColumnTypeEnum.ReferenceListItem: return "int";
                case DbColumnTypeEnum.Json: return "nvarchar(max)";
            }
            throw new TypeMismatchException($"There is no type matching for {type}");
        }
    }
}
