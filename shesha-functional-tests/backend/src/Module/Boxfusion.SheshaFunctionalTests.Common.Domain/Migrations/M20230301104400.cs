using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230301104400), MsSqlOnly]
    public class M20230301104400 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            if (!Schema.Table("SheshaFunctionalTests_Banks").Exists())
            {
                Create.Table("SheshaFunctionalTests_Banks")
                    .WithIdAsGuid()
                    .WithColumn("Name").AsString().Nullable()
                    .WithColumn("Description").AsString().Nullable()
                    .WithForeignKeyColumn("AddressId", "Core_Addresses").Nullable();
            }

            if (!Schema.Table("SheshaFunctionalTests_Accounts").Exists())
            {
                Create.Table("SheshaFunctionalTests_Accounts")
                    .WithIdAsGuid()
                    .WithColumn("AccountNumber").AsString().Unique().NotNullable()
                    .WithColumn("AccountTypeLkp").AsInt64().Nullable()
                    .WithForeignKeyColumn("BankId", "SheshaFunctionalTests_Banks").Nullable();
            }

            if (!Schema.Table("SheshaFunctionalTests_EmployeeAccounts").Exists())
            {
                Create.Table("SheshaFunctionalTests_EmployeeAccounts")
                    .WithIdAsGuid()
                    .WithForeignKeyColumn("EmployeeId", "SheshaFunctionalTests_Employees").NotNullable()
                    .WithForeignKeyColumn("AccountId", "SheshaFunctionalTests_Accounts").NotNullable();
            }
        }
    }
}
