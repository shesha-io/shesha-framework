using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220518134000), MsSqlOnly]
    public class M20220518134000 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Core_ShaRolePermissions")
                .WithIdAsGuid()
                .WithFullPowerEntityColumns()
                .WithColumn("Permission").AsString(1024).NotNullable()
                .WithColumn("IsGranted").AsBoolean().NotNullable().WithDefaultValue(true)
                .WithForeignKeyColumn("ShaRoleId", "Core_ShaRoles")
                ;

        }
    }
}
