using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20231204141400)]
    public class M20231204141400 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("TargetNotifiers").OnTable("AbpUserNotifications").AsString(1024);
            Create.Column("TargetNotifiers").OnTable("AbpNotifications").AsString(1024);
        }
    }
}
