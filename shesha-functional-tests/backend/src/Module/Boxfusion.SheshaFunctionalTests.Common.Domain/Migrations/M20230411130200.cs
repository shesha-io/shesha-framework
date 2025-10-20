using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230411130200)]
    public class M20230411130200 : OneWayMigration
    {
        public override void Up()
        {
            Rename.Table("SheshaFunctionalTests_Accounts").To("SheshaFunctionalTests_TestAccounts");
        }
    }
}
