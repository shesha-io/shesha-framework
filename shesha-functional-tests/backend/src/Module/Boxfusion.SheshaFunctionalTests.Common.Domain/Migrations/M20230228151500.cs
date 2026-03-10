using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230228151500)]
    public class M20230228151500 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_TestClasses")
                .AddColumn("SomeGenericPropId").AsString(100).Nullable()
                .AddColumn("SomeGenericPropDisplayName").AsString(1000).Nullable()
                .AddColumn("SomeGenericPropClassName").AsString(1000).Nullable()
                .AddColumn("SomeJsonAddressProp").AsStringMax().Nullable();
        }
    }
}
