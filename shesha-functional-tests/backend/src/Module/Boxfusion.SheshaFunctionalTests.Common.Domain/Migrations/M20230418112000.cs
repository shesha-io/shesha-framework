using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230418112000), MsSqlOnly]
    public class M20230418112000 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddForeignKeyColumn("SheshaFunctionalTests_BankId", "SheshaFunctionalTests_Banks").Nullable();
        }
    }
}
