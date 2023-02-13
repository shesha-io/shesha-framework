using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20220818181000)]
    public class M20220818181000 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddForeignKeyColumn("AddressId", "Core_Addresses")
                .AddForeignKeyColumn("WorkAddressId", "Core_Addresses")
                .AddColumn("MiddleName").AsString(50).Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}