using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230115092299)]
    public class M20230115092299 : OneWayMigration
    {
        public override void Up()
        {
            // remove settings configuration without corresponding configurations
            Execute.Sql(@"delete from 
	Frwk_ConfigurationItems
where
	ItemType = 'setting-configuration'
	and not exists (select 1 from Frwk_SettingConfigurations where Id = Frwk_ConfigurationItems.Id)");
        }
    }
}
