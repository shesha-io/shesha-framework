using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20231212122500), MsSqlOnly]
    public class M20231212122500 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Create.Table("SheshaFunctionalTests_Drivers")
                .WithIdAsGuid()
                .WithColumn("MainCar").AsStringMax().Nullable()
                .WithColumn("OtherCars").AsStringMax().Nullable();
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}