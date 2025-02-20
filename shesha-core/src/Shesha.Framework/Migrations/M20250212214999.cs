using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250212214999)]
    public class M20250212214999 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("Frwk_UserRegistration").Index("IX_Frwk_UserRegistration_UserNameOrEmailAddress").Exists())
                Create.Index("IX_Frwk_UserRegistration_UserNameOrEmailAddress").OnTable("Frwk_UserRegistration").OnColumn("UserNameOrEmailAddress");

            if (!Schema.Table("Frwk_UserRegistration").Index("IX_Frwk_UserRegistration_UserId").Exists())
                Create.Index("IX_Frwk_UserRegistration_UserId").OnTable("Frwk_UserRegistration").OnColumn("UserId");
        }
    }
}