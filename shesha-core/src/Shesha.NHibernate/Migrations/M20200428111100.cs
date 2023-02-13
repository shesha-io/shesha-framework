using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200428111100)]
    public class M20200428111100: Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Addresses")
                .AddDiscriminator();

            Execute.Sql("update Core_Addresses set Frwk_Discriminator = 'Shesha.Core.Address'");
        }

        public override void Down()
        {
            throw new System.NotImplementedException();
        }
    }
}
