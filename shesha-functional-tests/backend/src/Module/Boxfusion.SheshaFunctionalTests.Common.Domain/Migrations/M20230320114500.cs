using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230320114500)]
    public class M20230320114500 : AutoReversingMigration
    {
        public override void Up()
        {
            this.Shesha().SettingUpdate("Greeting")
                        .OnModule("Shesha")
                        .SetValue("Hello world");

            this.Shesha().SettingUpdate("IsAllowedTo")
                        .OnModule("Shesha")
                        .SetValue(true.ToString());
                 
        }
    }
}
