using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20250206203200)]
    public class M20250206203200 : OneWayMigration
    {
        public override void Up()
        {
			// update all entities configs
			Execute.Sql(@"update ""Frwk_EntityConfigs"" set ""PropertiesMD5"" = null");
        }
    }
}
