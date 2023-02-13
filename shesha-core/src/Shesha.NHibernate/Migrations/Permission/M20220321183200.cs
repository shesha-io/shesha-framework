using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220321183200)]
    public class M20220321183100 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.PermissionedObjects
            Create.Table("Frwk_PermissionedObjects")
                .WithIdAsGuid()
                .WithFullPowerEntityColumns()
                .WithColumn("Object").AsString(1000).NotNullable()
                .WithColumn("Category").AsString(255).NotNullable()
                .WithColumn("Description").AsString(1000).Nullable()
                .WithColumn("Permissions").AsString(1000).Nullable()
                .WithColumn("Parent").AsString(1000).Nullable()
                .WithColumn("Dependency").AsString(1000).Nullable()
                .WithColumn("Inherited").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithColumn("Hidden").AsBoolean().NotNullable().WithDefaultValue(false)
                ;
        }
    }
}
