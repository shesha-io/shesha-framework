using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20231214112400)]
    public class M20231214112400 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Column("TargetNotifiers").OnTable("AbpUserNotifications").AsString(1024).Nullable();
            Alter.Column("TargetNotifiers").OnTable("AbpNotifications").AsString(1024).Nullable();
        }
    }
}
