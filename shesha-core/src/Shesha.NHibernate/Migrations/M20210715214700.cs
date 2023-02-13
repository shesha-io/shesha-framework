using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20210715214700)]
    public class M20210715214700 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Facilities")
                 .AddColumn("Latitude").AsDecimal().Nullable()
                 .AddColumn("Longitude").AsDecimal().Nullable()
                 .AddColumn("Altitude").AsDecimal().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}