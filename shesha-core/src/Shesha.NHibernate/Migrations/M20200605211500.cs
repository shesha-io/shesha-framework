using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200605211500)]
    public class M20200605211500: AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_DeviceForceUpdates")
                .WithIdAsGuid()
                .WithColumn("Name").AsString(300).NotNullable()
                .WithColumn("Description").AsString().NotNullable()
                .WithColumn("AppStoreUrl").AsString().Nullable()
                .WithColumn("OSType").AsInt32().Nullable()
                .WithColumn("VersionNo").AsDouble().Nullable()
                .WithFullAuditColumns();
        }
    }
}
