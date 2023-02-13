using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220503185500)]
    public class M20220503185500 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.PermissionedObjects
            Alter.Table("Frwk_PermissionedObjects")
                .AddColumn("AccessLkp").AsInt32().NotNullable().WithDefaultValue(2);
                ;
        }
    }
}
