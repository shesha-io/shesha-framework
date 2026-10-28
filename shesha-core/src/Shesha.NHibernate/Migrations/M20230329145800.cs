using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230329145800), MsSqlOnly]
    public class M20230329145800 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Accounts").AddForeignKeyColumn("OrganisationId", "Core_Organisations");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}