using FluentMigrator;
using FluentMigrator.Builders;
using FluentMigrator.Builders.Alter.Table;
using FluentMigrator.Builders.Create.Table;
using FluentMigrator.Builders.Insert;
using FluentMigrator.Infrastructure;
using FluentMigrator.Runner.Extensions;
using System.Reflection;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// This class is an extension for migration system to make easier to some common tasks.
    /// Uses Shesha's standard naming conventions
    /// </summary>
    public static class SheshaFluentMigratorExtensions
    {
        private const int MsSqlVarcharMax = 1073741823;

        /// <summary>
        /// Insert bootstrapper force record to the bootstrapping info table
        /// </summary>
        public static void ForceBootstrapper(this IInsertExpressionRoot insert, string bootstrapperName)
        {
            insert.IntoTable("frwk_bootstrapper_startups")
                .Row(new Dictionary<string, object>
                {
                    { "id", Guid.NewGuid() },
                    { "creation_time", DateTime.Now },
                    { "force", true },
                    { "bootstrapper_name", bootstrapperName },
                    { "status", 0 }
                });
        }

        /// <summary>
        /// Adds foreign key column (int/int64/Guid acording to columnType) to the table
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithForeignKeyColumn(this ICreateTableWithColumnSyntax table, Type columnType, string columnName, string tableName)
        {
            return columnType.Is<int>()
                ? table.WithForeignKeyColumnInt(columnName, tableName)
                : columnType.Is<long>()
                    ? table.WithForeignKeyColumnInt64(columnName, tableName)
                    : table.WithForeignKeyColumn(columnName, tableName);
        }

        /// <summary>
        /// Adds foreign key column (Guid) to the table
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithForeignKeyColumn(this ICreateTableWithColumnSyntax table, string foreignColumn, string masterTable)
        {
            return table.WithColumn(foreignColumn).AsGuid().Nullable().ForeignKey(masterTable, DatabaseConsts.IdColumn).Indexed();
        }

        /// <summary>
        /// Adds foreign key column (int) to the table
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithForeignKeyColumnInt(this ICreateTableWithColumnSyntax table, string foreignColumn, string masterTable)
        {
            return table.WithColumn(foreignColumn).AsInt32().Nullable().ForeignKey(masterTable, DatabaseConsts.IdColumn).Indexed();
        }

        /// <summary>
        /// Adds foreign key column (Int64) to the table
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithForeignKeyColumnInt64(this ICreateTableWithColumnSyntax table, string foreignColumn, string masterTable)
        {
            return table.WithColumn(foreignColumn).AsInt64().Nullable().ForeignKey(masterTable, DatabaseConsts.IdColumn).Indexed();
        }

        /// <summary>
        /// Adds columns for <see cref="IHasOwningEntityLink"/>
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithMultipleOwnerColumns(this ICreateTableWithColumnSyntax table)
        {
            return table
                .WithColumn(DatabaseConsts.OwnerIdColumn).AsString(40).Nullable().Indexed()
                .WithColumn(DatabaseConsts.OwnerTypeColumn).AsString(100).Nullable().Indexed();
        }

        /// <summary>
        /// Adds columns for <see cref="IHasEntityLink"/>
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithEntityLinkColumns(this ICreateTableWithColumnSyntax table)
        {
            return table
                .WithColumn(DatabaseConsts.EntityIdColumn).AsString(40).Nullable().Indexed()
                .WithColumn(DatabaseConsts.EntityTypeColumn).AsString(100).Nullable().Indexed();
        }

        /// <summary>
        /// Add foreign key column (Guid)
        /// </summary>
        /// <param name="table">Table to add column (alter syntax)</param>
        /// <param name="foreignColumn">Foreign column</param>
        /// <param name="masterTable">Master table</param>
        /// <returns></returns>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddForeignKeyColumn(this IAlterTableAddColumnOrAlterColumnSyntax table, string foreignColumn, string masterTable)
        {
            return table.AddForeignKeyColumn(foreignColumn, masterTable, true);
        }

        /// <summary>
        /// Add foreign key column (Guid)
        /// </summary>
        /// <param name="table">Table to add column (alter syntax)</param>
        /// <param name="foreignColumn">Foreign column</param>
        /// <param name="masterTable">Master table</param>
        /// <param name="nullable">If true the column is nullable</param>
        /// <returns></returns>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddForeignKeyColumn(this IAlterTableAddColumnOrAlterColumnSyntax table, string foreignColumn, string masterTable, bool nullable) 
        {
            return table.AddForeignKeyColumn(foreignColumn, masterTable, DatabaseConsts.IdColumn, nullable);            
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddForeignKeyColumn(this IAlterTableAddColumnOrAlterColumnSyntax table, string foreignColumn, string masterTable, string primaryColumn)
        {
            return table.AddForeignKeyColumn(foreignColumn, masterTable, primaryColumn, true);
        }

        private static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddForeignKeyColumn(this IAlterTableAddColumnOrAlterColumnSyntax table, string foreignColumn, string masterTable, string primaryColumn, bool nullable)
        {
            var expression = table.AddColumn(foreignColumn).AsGuid();
            
            expression = nullable 
                ? expression.Nullable() 
                : expression.NotNullable();

            expression = expression.ForeignKey(masterTable, primaryColumn).Indexed();

            return expression;
        }

        /// <summary>
        /// Add foreign key column (bigint)
        /// </summary>
        /// <param name="table">Table to add column (alter syntax)</param>
        /// <param name="foreignColumn">Foreign column</param>
        /// <param name="masterTable">Master table</param>
        /// <returns></returns>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddForeignKeyColumnInt64(this IAlterTableAddColumnOrAlterColumnSyntax table, string foreignColumn, string masterTable)
        {
            return table.AddColumn(foreignColumn).AsInt64().Nullable().ForeignKey(masterTable, DatabaseConsts.IdColumn).Indexed();
        }

        #region Create table

        /// <summary>
        /// Adds full auditing fields to a table. See <see cref="IFullAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithFullAuditColumns(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null, bool indexed = false)
        {
            return table
                .WithAuditColumns(names, indexed)
                .WithDeletionAuditColumns(names, indexed);
        }

        public static ICreateTableColumnOptionOrWithColumnSyntax WithFullAuditedEntityWithExternalSyncColumns(this ICreateTableWithColumnSyntax table)
        {
            return table
                .WithFullAuditColumns()
                .WithColumn(DatabaseConsts.ExtSysFirstSyncDate).AsDateTime().Nullable()
                .WithColumn(DatabaseConsts.ExtSysId).AsString(50).Nullable()
                .WithColumn(DatabaseConsts.ExtSysLastSyncDate).AsDateTime().Nullable()
                .WithColumn(DatabaseConsts.ExtSysSource).AsString(50).Nullable()
                .WithColumn(DatabaseConsts.ExtSysSyncError).AsStringMax().Nullable()
                .WithColumn(DatabaseConsts.ExtSysSyncStatusLkp).AsInt32().Nullable();
        }

        /// <summary>
        /// Adds full auditing fields and tenant ID to a table. See <see cref="FullPowerEntity"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithFullPowerEntityColumns(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithAuditColumns(names)
                .WithDeletionAuditColumns(names)
                .WithTenantIdAsNullable(names);
        }

        /// <summary>
        /// Adds owner entity link, full auditing fields and tenant ID to a table. See <see cref="FullPowerChildEntity"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithFullPowerChildEntityColumns(this ICreateTableWithColumnSyntax table)
        {
            return table
                .WithMultipleOwnerColumns()
                .WithAuditColumns()
                .WithDeletionAuditColumns()
                .WithTenantIdAsNullable();
        }

        /// <summary>
        /// Adds entity link, owner entity link, full auditing fields and tenant ID to a table. See <see cref="FullPowerEntity"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithFullPowerManyToManyColumns(this ICreateTableWithColumnSyntax table)
        {
            return table
                .WithEntityLinkColumns()
                .WithMultipleOwnerColumns()
                .WithAuditColumns()
                .WithDeletionAuditColumns()
                .WithTenantIdAsNullable();
        }

        /// <summary>
        /// Adds auditing fields to a table. See <see cref="IAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithAuditColumns(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null, bool indexed = false)
        {
            return table
                .WithCreationAuditColumns(names, indexed)
                .WithModificationAuditColumns(names, indexed);
        }

        /// <summary>
        /// Adds CreatorUserId field to a table. See <see cref="ICreationAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithCreatorUserIdColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            var response = table
                .WithColumn(names.OrDefault().CreatorUserId).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
            return response;
        }

        /// <summary>
        /// Adds creation auditing fields to a table. See <see cref="ICreationAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithCreationAuditColumns(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null, bool indexed = false)
        {
            var result = table.WithCreationTimeColumn(names);

            result = result.WithCreatorUserIdColumn(names);
            if (indexed)
                result = result.Indexed();
            return result;
        }

        /// <summary>
        /// Adds LastModifierUserId field to a table. See <see cref="IModificationAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithLastModifierUserIdColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().LastModifierUserIdColumn).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        /// <summary>
        /// Return current names or fallback to default ones
        /// </summary>
        /// <param name="names"></param>
        /// <returns></returns>
        public static IDbObjectNames OrDefault(this IDbObjectNames? names) 
        {
            return names ?? new DefaultDbObjectNames();
        }

        /// <summary>
        /// Adds modification auditing fields to a table. See <see cref="IModificationAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithModificationAuditColumns(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null, bool indexed = false)
        {
            var result = table.WithLastModificationTimeColumn(names);

            result = result.WithLastModifierUserIdColumn(names);
            if (indexed)
                result = result.Indexed();

            return result;
        }

        /// <summary>
        /// Adds DeleterUserId field to a table. See <see cref="IDeletionAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithDeleterUserIdColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().DeleterUserIdColumn).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        /// <summary>
        /// Adds deletion auditing columns to a table. See <see cref="IModificationAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithDeletionAuditColumns(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null, bool indexed = false)
        {
            var result = table
                .WithIsDeletedColumn(names)
                .WithDeletionTimeColumn(names);
            result = result.WithDeleterUserIdColumn(names);
            if (indexed)
                result = result.Indexed();
            return result;
        }

        /// <summary>
        /// Adds TenantId column to a table as not nullable. See <see cref="AbpTenant{TUser}"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrForeignKeyCascadeOrWithColumnSyntax WithTenantIdAsRequired(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().TenantIdColumn).AsInt32().NotNullable().ForeignKey(DatabaseConsts.TenantsTable, DatabaseConsts.IdColumn);
        }

        /// <summary>
        /// Adds TenantId column to a table as nullable. See <see cref="AbpTenant{TUser}"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrForeignKeyCascadeOrWithColumnSyntax WithTenantIdAsNullable(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().TenantIdColumn).AsInt32().Nullable().ForeignKey(DatabaseConsts.TenantsTable, DatabaseConsts.IdColumn);
        }

        public static ICreateTableColumnOptionOrForeignKeyCascadeOrWithColumnSyntax WithUserId(this ICreateTableWithColumnSyntax table, string columnName)
        {
            return table
                .WithColumn(columnName).AsInt64().NotNullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        public static ICreateTableColumnOptionOrForeignKeyCascadeOrWithColumnSyntax WithNullableUserId(this ICreateTableWithColumnSyntax table, string columnName)
        {
            return table
                .WithColumn(columnName).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        #endregion

        #region Alter table

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddFullAuditColumns(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddAuditColumns()
                .AddDeletionAuditColumns();
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddAuditColumns(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddCreationAuditColumns()
                .AddModificationAuditColumns();
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddCreatorUserIdColumn(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.CreatorUserId).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddCreationAuditColumns(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddCreationTimeColumn()
                .AddCreatorUserIdColumn();
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddLastModifierUserIdColumn(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.LastModifierUserIdColumn).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddModificationAuditColumns(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddLastModificationTimeColumn()
                .AddLastModifierUserIdColumn();
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddDeletionAuditColumns(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddIsDeletedColumn()
                .AddDeletionTimeColumn()
                .AddColumn(DatabaseConsts.DeleterUserIdColumn).AsInt64().Nullable().ForeignKey(DatabaseConsts.UsersTable, DatabaseConsts.IdColumn);
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddTenantIdColumnAsRequired(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.TenantIdColumn).AsInt32().NotNullable().ForeignKey(DatabaseConsts.TenantsTable, DatabaseConsts.IdColumn);
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddTenantIdColumnAsNullable(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.TenantIdColumn).AsInt32().Nullable().ForeignKey(DatabaseConsts.TenantsTable, DatabaseConsts.IdColumn);
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddDiscriminator(this IAlterTableAddColumnOrAlterColumnSyntax table, string? name = null)
        {
            return table
                .AddColumn(name ?? DatabaseConsts.DiscriminatorColumn).AsString(DatabaseConsts.DiscriminatorMaxSize);
        }

        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddExternalSyncColumns(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn("ExtSysFirstSyncDate").AsDateTime().Nullable()
                .AddColumn("ExtSysId").AsString(50).Nullable()
                .AddColumn("ExtSysLastSyncDate").AsDateTime().Nullable()
                .AddColumn("ExtSysSource").AsString(50).Nullable()
                .AddColumn("ExtSysSyncError").AsStringMax().Nullable()
                .AddColumn("ExtSysSyncStatusLkp").AsInt32().Nullable();
        }

        #endregion

        /// <summary>
        /// Adds an auto increment <see cref="int"/> primary key to the table.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithIdAsInt32(this ICreateTableWithColumnSyntax table, string? name = null)
        {
            return table
                .WithColumn(name ?? DatabaseConsts.IdColumn).AsInt32().NotNullable().PrimaryKey().Identity();
        }

        /// <summary>
        /// Adds an auto increment <see cref="long"/> primary key to the table.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithIdAsInt64(this ICreateTableWithColumnSyntax table, string? name = null)
        {
            return table
                .WithColumn(name ?? DatabaseConsts.IdColumn).AsInt64().NotNullable().PrimaryKey().Identity();
        }

        /// <summary>
        /// Adds an <see cref="Guid"/> primary key to the table.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithIdAsGuid(this ICreateTableWithColumnSyntax table, string? name = null)
        {
            return table
                .WithColumn(name ?? DatabaseConsts.IdColumn).AsGuid().NotNullable().PrimaryKey();
        }

        /// <summary>
        /// Adds IsDeleted column to the table. See <see cref="ISoftDelete"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithIsDeletedColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().IsDeletedColumn).AsBoolean().NotNullable().WithDefaultValue(false);
        }

        /// <summary>
        /// Adds IsDeleted column to the table. See <see cref="ISoftDelete"/>.
        /// </summary>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddIsDeletedColumn(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.IsDeletedColumn).AsBoolean().NotNullable().WithDefaultValue(false);
        }

        /// <summary>
        /// Adds DeletionTime column to a table. See <see cref="IDeletionAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithDeletionTimeColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().DeletionTimeColumn).AsDateTime().Nullable();
        }

        /// <summary>
        /// Adds DeletionTime column to a table. See <see cref="IDeletionAudited"/>.
        /// </summary>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddDeletionTimeColumn(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.DeletionTimeColumn).AsDateTime().Nullable();
        }

        /// <summary>
        /// Ads CreationTime field to the table for <see cref="IHasCreationTime"/> interface.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithCreationTimeColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().CreationTimeColumn).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentDateTime);
        }

        /// <summary>
        /// Adds CreationTime field to a table. See <see cref="IHasCreationTime"/>.
        /// </summary>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddCreationTimeColumn(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.CreationTimeColumn).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentDateTime);
        }

        /// <summary>
        /// Adds LastModificationTime field to a table. See <see cref="IModificationAudited"/>.
        /// </summary>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddLastModificationTimeColumn(this IAlterTableAddColumnOrAlterColumnSyntax table)
        {
            return table
                .AddColumn(DatabaseConsts.LastModificationTimeColumn).AsDateTime().Nullable();
        }

        /// <summary>
        /// Adds LastModificationTime field to a table. See <see cref="IModificationAudited"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithLastModificationTimeColumn(this ICreateTableWithColumnSyntax table, IDbObjectNames? names = null)
        {
            return table
                .WithColumn(names.OrDefault().LastModificationTimeColumn).AsDateTime().Nullable();
        }

        /// <summary>
        /// Adds IsDeleted column to the table. See <see cref="IPassivable"/>.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithIsActiveColumn(this ICreateTableWithColumnSyntax table, bool defaultValue = true)
        {
            return table
                .WithColumn(DatabaseConsts.IsActiveColumn).AsBoolean().NotNullable().WithDefaultValue(defaultValue);
        }

        /// <summary>
        /// Adds IsDeleted column to the table. See <see cref="IPassivable"/>.
        /// </summary>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddIsActiveColumn(this IAlterTableAddColumnOrAlterColumnSyntax table, bool defaultValue = true)
        {
            return table
                .AddColumn(DatabaseConsts.IsActiveColumn).AsBoolean().NotNullable().WithDefaultValue(defaultValue);
        }

        /// <summary>
        /// Adds GenericEntityReference columns to the table for spcified PropertyName/>.
        /// </summary>
        public static IAlterTableColumnOptionOrAddColumnOrAlterColumnSyntax AddGenericEntityReferenceColumns(this IAlterTableAddColumnOrAlterColumnSyntax table, string propertyName, bool storyDisplayName = false)
        {
            var f = table
                .AddColumn($"{propertyName}Id").AsString(100).Nullable()
                .AddColumn($"{propertyName}TypeName").AsString(1000).Nullable();
            if (storyDisplayName)
                return f.AddColumn($"{propertyName}DisplayName").AsString(1000).Nullable();
            return f;
        }

        /// <summary>
        /// Defines the column type as unicode string of max size
        /// </summary>
        /// <typeparam name="TNext"></typeparam>
        /// <param name="columnSyntax"></param>
        /// <returns></returns>
        public static TNext AsStringMax<TNext>(this IColumnTypeSyntax<TNext> columnSyntax) where TNext: IFluentSyntax
        {
            return columnSyntax.AsString(MsSqlVarcharMax);
        }

        /// <summary>
        /// Adds discriminator field to a table.
        /// </summary>
        public static ICreateTableColumnOptionOrWithColumnSyntax WithDiscriminator(this ICreateTableWithColumnSyntax table, string? name = null)
        {
            return table.WithColumn(name ?? DatabaseConsts.DiscriminatorColumn).AsString(DatabaseConsts.DiscriminatorMaxSize);
        }

        /// <summary>
        /// Generates standard name for the column index
        /// </summary>
        /// <param name="table"></param>
        /// <param name="column"></param>
        /// <returns></returns>
        public static string GenerateIndexNameForColumn(string table, string column)
        {
            // NOTE: Don't change this code, it's used in the migrations
            return $"idx_{table}_{column}";
        }

        #region Add syntax

        public static SheshaExpressionRoot Shesha(this MigrationBase migration)
        {
            var contextProp = typeof(MigrationBase).GetProperty("Context", BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public);
            if (contextProp == null)
                throw new Exception("Failed to get migration context");
            var context = contextProp.GetValue(migration) as IMigrationContext;
            if (context == null)
                throw new SheshaMigrationException($"Migration context must implement {nameof(IMigrationContext)} interface");
                
            return new SheshaExpressionRoot(context, migration);
        }

        #endregion

        public static TNext AsCaseInsensitiveString<TNext>(this IColumnTypeSyntax<TNext> syntax) where TNext : IFluentSyntax
        {
            var dbmsType = DbConnectionSettings.Current?.DbmsType;
            switch (dbmsType) 
            {
                case DbmsType.PostgreSQL:
                    return syntax.AsCustom("citext");
                case DbmsType.SQLServer:
                default:
                    return syntax.AsString();
            }
        }
        public static TNext AsCaseInsensitiveString<TNext>(this IColumnTypeSyntax<TNext> syntax, int size) where TNext : IFluentSyntax
        {
            var dbmsType = DbConnectionSettings.Current?.DbmsType;
            switch (dbmsType)
            {
                case DbmsType.PostgreSQL:
                    return syntax.AsCustom("citext");
                case DbmsType.SQLServer:
                default:
                    return syntax.AsString(size);
            }
        }

        public static TNext AsCaseInsensitiveStringMax<TNext>(this IColumnTypeSyntax<TNext> syntax) where TNext : IFluentSyntax
        {
            var dbmsType = DbConnectionSettings.Current?.DbmsType;
            switch (dbmsType)
            {
                case DbmsType.PostgreSQL:
                    return syntax.AsCustom("citext");
                case DbmsType.SQLServer:
                default:
                    return syntax.AsString(MsSqlVarcharMax);
            }
        }
    }
}
