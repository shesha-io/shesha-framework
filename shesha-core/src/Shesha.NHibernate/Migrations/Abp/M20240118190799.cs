using FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20240118190799)]
    public class M20240118190799 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Column("TargetNotifiers").OnTable("AbpNotificationSubscriptions").AsString(1024).Nullable();
        }
    }
}
