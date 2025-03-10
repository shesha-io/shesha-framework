﻿using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240726090600)]
    public class M20240726090600 : Migration
    {
        public override void Up()
        {
     
            Delete.Column("OperatingHoursStartTime").FromTable("Core_Sites");
            Delete.Column("OperatingHoursClosingTime").FromTable("Core_Sites");

            Alter.Table("Core_Sites")
             .AddColumn("OperatingHoursStartTimeTicks").AsInt64().Nullable()
             .AddColumn("OperatingHoursClosingTimeTicks").AsInt64().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
