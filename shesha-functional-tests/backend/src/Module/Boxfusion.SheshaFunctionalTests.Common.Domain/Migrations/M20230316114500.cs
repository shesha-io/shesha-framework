using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230316114500), MsSqlOnly]
    public class M20230316114500 : AutoReversingMigration
    {
        public override void Up()
        {

            // Create two settings
            this.Shesha().SettingCreate("Greeting", "Login greeting template")
                .OnModule("Boxfusion.SheshaFunctionalTests.Common")
               .WithCategory("Logon") // set category, is unsed in the generic settings UI
               .WithDescription("I am testing a useful setting") // mark setting as application specific
               .AsString(); // set datatype of the setting

            this.Shesha().SettingCreate("IsAllowedTo", "Logged in user is allowed to be awesome")
                .OnModule("Boxfusion.SheshaFunctionalTests.Common")
                .WithCategory("Logon")
                .WithDescription("Is the logged in user allowed to be awesome?")
                .AsBoolean();
        }
    }
}
