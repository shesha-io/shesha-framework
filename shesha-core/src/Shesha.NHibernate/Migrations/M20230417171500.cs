using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230417171500), MsSqlOnly]
    public class M20230417171500 : Migration
    {
        public override void Up()
        {
            this.Shesha().ReferenceListCreate("Shesha.Core", "OrganisationUnitType");

        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
