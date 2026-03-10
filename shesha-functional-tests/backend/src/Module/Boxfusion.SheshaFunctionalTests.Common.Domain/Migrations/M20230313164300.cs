using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230313164300)]
    public class M20230313164300 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
               .AddColumn("SheshaFunctionalTests_MembershipStatusLkp").AsInt64().Nullable();
        }
    }
}
