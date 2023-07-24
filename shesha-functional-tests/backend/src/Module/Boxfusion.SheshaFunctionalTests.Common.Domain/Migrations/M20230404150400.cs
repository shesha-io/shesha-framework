using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230404150400), MsSqlOnly]
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
            /* Not working */
            //this.Shesha()
            //    .SettingUpdate("IsAllowedTo")
            //    .OnModule("Boxfusion.SheshaFunctionalTests.Common")
            //    .SetValue(false.ToString());
        }
    }
}
