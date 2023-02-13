using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20210722181500)]
    public class M20210722181500 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Facilities")
                .AddForeignKeyColumn("PartOfId", "Core_Facilities");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}