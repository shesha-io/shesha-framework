using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230411122499), MsSqlOnly]
    public class M20230411122499 : OneWayMigration
    {
        public override void Up()
        {
			// Delete old sms gateways settings (converted to objects). We do it here just because these settings were not used before

            Execute.Sql(@"delete from Frwk_SettingValues where SettingConfigurationId in (
	select 
		ci.Id
	from 
		Frwk_ConfigurationItems ci
	where
		ci.ItemType = 'setting-configuration'
		and (
			ci.name like 'Shesha.Sms.BulkSms%'
			or ci.name like 'Shesha.Sms.Clickatell%'
			or ci.name like 'Shesha.Sms.SmsPortal%'
			or ci.name like 'Shesha.Sms.Xml2Sms%'
		)
)");
            Execute.Sql(@"delete from Frwk_SettingConfigurations where Id in (
	select 
		ci.Id
	from 
		Frwk_ConfigurationItems ci
	where
		ci.ItemType = 'setting-configuration'
		and (
			ci.name like 'Shesha.Sms.BulkSms%'
			or ci.name like 'Shesha.Sms.Clickatell%'
			or ci.name like 'Shesha.Sms.SmsPortal%'
			or ci.name like 'Shesha.Sms.Xml2Sms%'
		)
)");
            Execute.Sql(@"delete
from 
	Frwk_ConfigurationItems 
where
	ItemType = 'setting-configuration'
	and (
		name like 'Shesha.Sms.BulkSms%'
		or name like 'Shesha.Sms.Clickatell%'
		or name like 'Shesha.Sms.SmsPortal%'
		or name like 'Shesha.Sms.Xml2Sms%'
	)");
        }
    }
}
