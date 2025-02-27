using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240725180100)]
    public class M20240725180100 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Sites")
                .AddColumn("OperatingHoursStartTime").AsDateTime().Nullable()
                .AddColumn("OperatingHoursClosingTime").AsDateTime().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
