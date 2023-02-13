using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200419202000)]
    public class M20200419202000: Migration
    {
        public override void Up()
        {
            if (!Schema.Table("Core_ShaRoles").Column("IsRegionSpecific").Exists())
                Alter.Table("Core_ShaRoles").AddColumn("IsRegionSpecific").AsBoolean().WithDefaultValue(0);
            else
                Alter.Column("IsRegionSpecific").OnTable("Core_ShaRoles").AsBoolean().WithDefaultValue(0);
        }
        
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
