using FluentMigrator;
using System;
using Shesha.FluentMigrator;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230320114500), MsSqlOnly]
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
