using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20231212122500)]
    public class M20231212122500 : OneWayMigration
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
    }
}