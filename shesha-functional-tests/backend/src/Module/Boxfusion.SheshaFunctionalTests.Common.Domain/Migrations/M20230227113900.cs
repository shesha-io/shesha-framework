using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230227113900), MsSqlOnly]
    public class M20230227113900 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            if (!Schema.Table("SheshaFunctionalTests_TestClasses").Exists())
            {
                Create.Table("SheshaFunctionalTests_TestClasses")
                    .WithIdAsGuid()
                    .WithColumn("TestProp").AsString().Nullable()
                    .WithColumn("JsonProp").AsCustom("nvarchar(max)").Nullable()
                    .WithColumn("ReflistPropLkp").AsInt64().Nullable();
            }
        }
    }
}
