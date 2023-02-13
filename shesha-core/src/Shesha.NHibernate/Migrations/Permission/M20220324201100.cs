using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220324201100)]
    public class M20220324201100 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.PermissionDefinition
            Create.Table("Frwk_PermissionDefinitions")
                .WithIdAsGuid()
                .WithFullPowerEntityColumns()
                .WithColumn("Parent").AsString(512).Nullable()
                .WithColumn("Name").AsString(512).NotNullable()
                .WithColumn("DisplayName").AsString(512).NotNullable()
                .WithColumn("Description").AsString(2000).Nullable()
                ;
        }
    }
}
