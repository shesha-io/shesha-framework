using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230316144800)]
    public class M20230316144800 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("SheshaFunctionalTests_TestClasses").Column("TestListOfJsonHouses").Exists())
            {
                Create.Column("TestListOfJsonHouses").OnTable("SheshaFunctionalTests_TestClasses")
                    .AsStringMax()
                    .Nullable();
            }

            if (!Schema.Table("Core_Persons").Column("SheshaFunctionalTests_ImageAnnotation").Exists())
            {
                Create.Column("SheshaFunctionalTests_ImageAnnotation").OnTable("Core_Persons")
                    .AsStringMax()
                    .Nullable();
            }

            if (!Schema.Table("Core_Persons").Column("SheshaFunctionalTests_CommunicationLanguageLkp").Exists())
            {
                Create.Column("SheshaFunctionalTests_CommunicationLanguageLkp").OnTable("Core_Persons")
                    .AsInt64()
                    .Nullable();
            }
        }
    }
}
