using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20220823114700)]
    public class M20220823114700 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            // bootstrapper was changed, force to execute after this update
            Execute.Sql("update Frwk_EntityConfigs set PropertiesMD5 = null");
        }
    }
}
