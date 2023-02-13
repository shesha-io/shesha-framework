using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200521082200)]
    public class M20200521082200: Migration
    {
        public override void Up()
        {
            // was added in some projects locally
            if (!Schema.Table("Core_Facilities").Column(SheshaDatabaseConsts.DiscriminatorColumn).Exists())
                Alter.Table("Core_Facilities").AddDiscriminator();

            Execute.Sql("update Core_Facilities set Frwk_Discriminator = 'Core.Facility' where Frwk_Discriminator is null");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
