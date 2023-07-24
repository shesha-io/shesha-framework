using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20220908155200), MsSqlOnly]
    public class M20220908155200 : Migration
    {
        public override void Up()
        {
            if(!Schema.Table("Test_PersonEntities").Exists())
            {
                Create.Table("Test_PersonEntities")
                    .WithColumn("Name").AsString()
                    .WithColumn("HomeAddress").AsString().Nullable()
                    .WithColumn("OfficeAddress").AsString().Nullable()
                    .WithIdAsGuid();
            }
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}