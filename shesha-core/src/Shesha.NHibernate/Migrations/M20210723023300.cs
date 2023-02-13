using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20210723023300)]
    public class M20210723023300 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
                 .AddColumn("IsMobileVerified").AsBoolean().WithDefaultValue(0)
                 .AddColumn("SecurityPin").AsString().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}