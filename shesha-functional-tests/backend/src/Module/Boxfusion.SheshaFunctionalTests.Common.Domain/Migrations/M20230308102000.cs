using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230308102000), MsSqlOnly]
    public class M202303081020000 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

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
