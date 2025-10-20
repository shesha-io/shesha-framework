﻿using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230404151800)]
    public class M20230404151800 : AutoReversingMigration
    {
        public override void Up()
        {
            // create a `AutoLogoffTimeout` setting on module `TestModule`
            this.Shesha().SettingCreate("AutoLogoffTimeout", "Auto logoff timeout")
                .WithCategory("Logon")
                .OnModule("Boxfusion.SheshaFunctionalTests.Common")
                .WithDescription("Auto logoff timeout (seconds)")
                .AsInt64();

            // update value of the `AutoLogoffTimeout` setting
            this.Shesha().SettingUpdate("AutoLogoffTimeout")
                // define a module explicitly
                .OnModule("Boxfusion.SheshaFunctionalTests.Common")
                .SetValue("300");
        }
    }
}
