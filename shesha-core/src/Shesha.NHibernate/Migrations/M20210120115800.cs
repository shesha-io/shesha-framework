using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210120115800)]
    public class M20210120115800: Migration
    {
        public override void Up()
        {
            Alter.Table("Core_OrganisationPersons").AddDiscriminator();
            Execute.Sql("update Core_OrganisationPersons set Frwk_Discriminator = 'Shesha.Core.OrganisationPerson'");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
