﻿using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230316114400)]
    public class M20230316114400 : AutoReversingMigration
    {
        public override void Up()
        {

            // Create two settings
            this.Shesha().SettingCreate("Greeting", "Login greeting template")
               .WithCategory("Logon") // set category, is unsed in the generic settings UI
               .WithDescription("I am testing a useful setting") // mark setting as application specific 
               .OnModule("Shesha")
               .AsString(); // set datatype of the setting

            this.Shesha().SettingCreate("IsAllowedTo", "Logged in user is allowed to be awesome")
                .WithCategory("Logon")
                .WithDescription("Is the logged in user allowed to be awesome?")
                .OnModule("Shesha")
                .AsBoolean();
        }
    }
}
