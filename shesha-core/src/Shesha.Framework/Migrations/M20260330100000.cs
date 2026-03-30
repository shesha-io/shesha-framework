using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260330100000)]
    public class M20260330100000 : OneWayMigration
    {
        public override void Up()
        {
            // Add release tracking columns to application_startups.
            // has_modules_changed: true when at least one module assembly changed version/md5 vs the previous startup.
            // main_module_version: version of the root (startup) module assembly at the time of this startup.
            Alter.Table("frwk_application_startups")
                .AddColumn("has_modules_changed").AsBoolean().NotNullable().WithDefaultValue(false)
                .AddColumn("main_module_version").AsString(100).Nullable();
        }
    }
}
