using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20231214112400)]
    public class M20231214112400 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("TargetNotifiers").OnTable("AbpUserNotifications").AsString(1024).Nullable();
            Create.Column("TargetNotifiers").OnTable("AbpNotifications").AsString(1024).Nullable();
        }
    }
}
