using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20220706104100), MsSqlOnly]
    public class M20220706104100 : Migration
    {
        public override void Up()
        {
            Delete.Table("Core_OrganisationBankAccounts");
            Delete.Table("Core_BankAccounts");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
