using Abp.Collections.Extensions;
using Abp.Domain.Uow;
using NHibernate;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.NHibernate.UoW;
using Shesha.Reflection;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DbActions
{
    public class DbMsSqlGenerateActions : BaseDbMetadataActions
    {
        public override string SchemaName => CurrentSchema.IsNullOrEmpty() ? "dbo" : CurrentSchema.NotNull();

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

        protected override async Task CreateInternalManyToManyTableAsync(
            string tableName,
            string primaryTableName, string foreignTableName,
            string primaryIdName, string foreignIdName,
            string keyColumnName, string foreignColumnName
            )
        {
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");

            var names = tableName.Split(".");
            var table = names.Length == 1 ? tableName : names[1];

            await session
                .CreateSQLQuery(@$"CREATE TABLE {tableName} ([{keyColumnName}] [uniqueidentifier] NOT NULL, [{foreignColumnName}] [uniqueidentifier] NOT NULL)")
                .ExecuteUpdateAsync();

            await session
                .CreateSQLQuery($"ALTER TABLE {tableName} WITH CHECK ADD CONSTRAINT [FK_{table}_{keyColumnName}_{primaryTableName.Replace(".", "_")}] FOREIGN KEY([{keyColumnName}]) REFERENCES {primaryTableName} ([{primaryIdName}])")
                .ExecuteUpdateAsync();

            await session
                .CreateSQLQuery($"ALTER TABLE {tableName} WITH CHECK ADD CONSTRAINT [FK_{table}_{foreignColumnName}_{foreignTableName.Replace(".", "_")}] FOREIGN KEY([{foreignColumnName}]) REFERENCES {foreignTableName} ([{foreignIdName}])")
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

            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD CONSTRAINT [{NC($"DF_{CurrentTable}_CreationTime")}] DEFAULT (getdate()) FOR [{NC("CreationTime")}]")
                .ExecuteUpdateAsync();

            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD CONSTRAINT [{NC($"DF_{CurrentTable}_IsDeleted")}] DEFAULT ((0)) FOR [{NC("IsDeleted")}]")
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
            var primaryTable = primaryTableName.Split('.').Last();
            var session = ((_unitOfWorkManager.Current as NhUnitOfWork)?.GetSession()).NotNull("DbMsSqlGenerateActions - session should be opened");
            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} ADD {CurrentColumn} uniqueidentifier Null")
                .ExecuteUpdateAsync();
            await session
                .CreateSQLQuery($"ALTER TABLE {TableName} WITH CHECK ADD CONSTRAINT [{NC($"FK_{CurrentTable}_{CurrentColumn}_{primaryTable}")}] FOREIGN KEY([{CurrentColumn}]) REFERENCES {primaryTableName} ({primaryColumnName})")
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
                // ToDo: AS - what is the date and time in the DB?
                case DbColumnTypeEnum.Date: return "datetime";
                case DbColumnTypeEnum.Time: return "datetime";
                case DbColumnTypeEnum.DateTime: return "datetime";
                case DbColumnTypeEnum.ReferenceListItem: return "int";
                case DbColumnTypeEnum.Json: return "nvarchar(max)";
            }
            throw new TypeMismatchException($"There is no type matching for {type}");
        }
    }
}
