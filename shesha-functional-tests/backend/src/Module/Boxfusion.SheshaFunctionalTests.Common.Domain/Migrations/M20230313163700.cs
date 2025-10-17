using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230313163700)]
    public class M20230313163700 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddColumn("SheshaFunctionalTests_MembershipNumber").AsString().Nullable()
                .AddColumn("SheshaFunctionalTests_ResidentialAddress").AsString().Nullable()
                .AddForeignKeyColumn("SheshaFunctionalTests_RegionId", "Core_Areas").Nullable()
                .AddForeignKeyColumn("SheshaFunctionalTests_BranchId", "Core_Areas").Nullable()
                .AddColumn("SheshaFunctionalTests_MembershipStartDate").AsDateTime().Nullable()
                .AddColumn("SheshaFunctionalTests_MembershipEndDate").AsDateTime().Nullable();
        }
    }
}
