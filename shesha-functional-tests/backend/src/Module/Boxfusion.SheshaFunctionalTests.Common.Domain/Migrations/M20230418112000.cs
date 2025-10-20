using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230418112000)]
    public class M20230418112000 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddForeignKeyColumn("SheshaFunctionalTests_BankId", "SheshaFunctionalTests_Banks").Nullable();
        }
    }
}
