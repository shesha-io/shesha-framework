using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230411130200), MsSqlOnly]
    public class M20230411130200 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Rename.Table("SheshaFunctionalTests_Accounts").To("SheshaFunctionalTests_TestAccounts");
        }
    }
}
