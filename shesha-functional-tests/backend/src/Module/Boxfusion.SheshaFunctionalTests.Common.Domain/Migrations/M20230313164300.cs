using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230313164300), MsSqlOnly]
    public class M20230313164300 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Alter.Table("Core_Persons")
               .AddColumn("SheshaFunctionalTests_MembershipStatusLkp").AsInt64().Nullable();
        }
    }
}
