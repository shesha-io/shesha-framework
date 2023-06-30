using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20230413191400), MsSqlOnly]
    public class M20230413191400 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_StoredFiles").AddColumn("OwnerId").AsString(100).Nullable();
            Alter.Table("Frwk_StoredFiles").AddColumn("OwnerClassName").AsString(1000).Nullable();
            Alter.Table("Frwk_StoredFiles").AddColumn("Temporary").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_StoredFiles").AddColumn("TemporaryOwnerProperty").AsString(1000).Nullable();

            Execute.Sql("update Frwk_StoredFiles set OwnerId = Frwk_OwnerId, OwnerClassName = Frwk_OwnerType");

            Delete.Index("IX_Frwk_StoredFiles_Owner").OnTable("Frwk_StoredFiles");

            Delete.Column("Frwk_OwnerId").FromTable("Frwk_StoredFiles");
            Delete.Column("Frwk_OwnerType").FromTable("Frwk_StoredFiles");

            Create.Index("IX_Frwk_StoredFiles_Owner").OnTable("Frwk_StoredFiles")
                .OnColumn("OwnerId").Ascending()
                .OnColumn("OwnerClassName").Ascending()
                .OnColumn("CategoryLkp").Ascending()
                .OnColumn("IsDeleted").Ascending();
        }
    }
}
