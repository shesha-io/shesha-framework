using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20231101142600)]
    public class M20231101142600 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_MobileDevices").AddDiscriminator().WithDefaultValue("");
        }
    }
}
