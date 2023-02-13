using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200219112400)]
    public class M20200219112400: AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_MobileDevices")
                .WithIdAsGuid()
                .WithColumn("Name").AsString(300).NotNullable()
                .WithColumn("IMEI").AsString(30).NotNullable()
                .WithColumn("IsLocked").AsBoolean().WithDefaultValue(0).NotNullable()
                .WithFullAuditColumns();
        }
    }
}
