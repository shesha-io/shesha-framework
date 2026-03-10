using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230227113900)]
    public class M20230227113900 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("SheshaFunctionalTests_TestClasses").Exists())
            {
                Create.Table("SheshaFunctionalTests_TestClasses")
                    .WithIdAsGuid()
                    .WithColumn("TestProp").AsString().Nullable()
                    .WithColumn("JsonProp").AsStringMax().Nullable()
                    .WithColumn("ReflistPropLkp").AsInt64().Nullable();
            }
        }
    }
}
