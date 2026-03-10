using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230308102000)]
    public class M202303081020000 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("SheshaFunctionalTests_TestClasses").Column("TestListOfJsonEntitiesProp").Exists())
            {
                Create.Column("TestListOfJsonEntitiesProp").OnTable("SheshaFunctionalTests_TestClasses")
                    .AsStringMax()
                    .Nullable();
            }
        }
    }
}
