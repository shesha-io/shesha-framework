using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200617082900)]
    public class M20200617082900: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_UserLoginAttempts").AddColumn("LoginAttemptNumber").AsInt32().Nullable();
        }
    }
}
