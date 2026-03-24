using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260324100000)]
    public class M20260324100000 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_Modules").AddColumn("ReleaseDate").AsDateTime().Nullable();

            // Drop the single-column unique index — uniqueness is now enforced on Name + CurrentVersionNo
            Delete.Index("uq_Frwk_Modules_Name").OnTable("Frwk_Modules");
            Create.Index("uq_Frwk_Modules_Name_Version")
                .OnTable("Frwk_Modules")
                .OnColumn("Name").Ascending()
                .OnColumn("CurrentVersionNo").Ascending()
                .WithOptions().Unique();
        }
    }
}
