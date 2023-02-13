using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200224155100)]
    public class M20200224155100: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_UserLoginAttempts").AddColumn("DeviceName").AsString(255).Nullable();
        }
    }
}
