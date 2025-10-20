using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230404150400)]
    public class M20230404150400 : AutoReversingMigration
    {
        public override void Up()
        {
            this.Shesha()
                .SettingDelete("Greeting")
                .FromModule("Shesha");

            this.Shesha()
                .SettingDelete("IsAllowedTo")
                .FromModule("Shesha");
        }
    }
}
