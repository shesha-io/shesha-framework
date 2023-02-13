using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20220706104100)]
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
