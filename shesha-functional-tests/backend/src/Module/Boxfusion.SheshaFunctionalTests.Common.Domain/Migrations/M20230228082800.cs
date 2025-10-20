using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230228082800)]
    public class M20230228082800 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("SheshaFunctionalTests_Brands").Exists())
            {
                Create.Table("SheshaFunctionalTests_Brands")
                    .WithIdAsGuid()
                    .WithColumn("Name").AsString().Nullable()
                    .WithColumn("Description").AsString().Nullable()
                    .WithColumn("WebsiteUrl").AsString().Nullable();
            }

            if (!Schema.Table("SheshaFunctionalTests_Employees").Exists())
            {
                Create.Table("SheshaFunctionalTests_Employees")
                    .WithIdAsGuid()
                    .WithColumn("FirstName").AsString().Nullable()
                    .WithColumn("LastName").AsString().Nullable()
                    .WithForeignKeyColumn("CompanyId", "Core_Organisations").Nullable();
            }

        }
    }
}
