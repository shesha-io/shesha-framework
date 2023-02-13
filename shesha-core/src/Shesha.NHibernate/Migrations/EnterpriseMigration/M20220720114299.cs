using FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220720114299)]
    public class M20220720114299 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Execute.Sql(@"update Core_Persons set Frwk_Discriminator = 'entpr.Employee' where Frwk_Discriminator = 'Core.Employee'");
        }
    }
}