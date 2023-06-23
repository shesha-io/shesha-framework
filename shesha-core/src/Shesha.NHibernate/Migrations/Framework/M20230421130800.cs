using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20230421130800), MsSqlOnly]
    public class M20230421130800 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_StoredFiles").AddColumn("Category").AsString(1000).Nullable();

            Execute.Sql("update Frwk_StoredFiles set Category = CategoryLkp");

            Delete.Index("IX_Frwk_StoredFiles_Owner").OnTable("Frwk_StoredFiles");

            Delete.Column("CategoryLkp").FromTable("Frwk_StoredFiles");

            Create.Index("IX_Frwk_StoredFiles_Owner").OnTable("Frwk_StoredFiles")
                .OnColumn("OwnerId").Ascending()
                .OnColumn("OwnerClassName").Ascending()
                .OnColumn("Category").Ascending()
                .OnColumn("IsDeleted").Ascending();
        }
    }
}
