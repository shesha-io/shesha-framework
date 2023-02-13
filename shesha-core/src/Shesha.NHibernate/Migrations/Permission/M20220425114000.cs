using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220425114000)]
    public class M20220425114000 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.PermissionedObjects
            Alter.Table("Frwk_PermissionedObjects")
                .AddColumn("Module").AsString(1000).NotNullable()
                .AddColumn("Name").AsString(1000).NotNullable()
                .AddColumn("Type").AsString(1000).NotNullable()
                ;
            Alter.Column("Category").OnTable("Frwk_PermissionedObjects").AsString(1000).Nullable();
        }
    }
}
