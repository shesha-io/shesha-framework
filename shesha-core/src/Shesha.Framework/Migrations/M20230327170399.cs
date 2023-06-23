using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
	[Migration(20230327170399), MsSqlOnly]
    public class M20230327170399 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"delete 
from 
	Frwk_SettingValues
where
	SettingConfigurationId in (
		select 
			ci.Id
		from	
			Frwk_ConfigurationItems ci
		where
			ci.ModuleId is null 
			and ci.ItemType = 'setting-configuration'
			and ci.Name in (
				'Shesha.Push.PushNotifier',
				'Shesha.Otp.IgnoreOtpValidation',
				'Shesha.Otp.Alphabet',
				'Shesha.Sms.RedirectAllMessagesTo',
				'Shesha.Otp.PasswordLength',
				'Shesha.Otp.DefaultEmailBodyTemplate',
				'Shesha.Otp.DefaultLifetime',
				'Shesha.Otp.DefaultEmailSubjectTemplate',
				'Shesha.Otp.DefaultSubjectTemplate',
				'Shesha.Otp.DefaultBodyTemplate',
				'Shesha.Sms.SmsGateway'
			)	
	)");
            
			Execute.Sql(@"delete 
from 
	Frwk_SettingConfigurations
where
	id in (
		select 
			ci.Id
		from	
			Frwk_ConfigurationItems ci
		where
			ci.ModuleId is null 
			and ci.ItemType = 'setting-configuration'
			and ci.Name in (
				'Shesha.Push.PushNotifier',
				'Shesha.Otp.IgnoreOtpValidation',
				'Shesha.Otp.Alphabet',
				'Shesha.Sms.RedirectAllMessagesTo',
				'Shesha.Otp.PasswordLength',
				'Shesha.Otp.DefaultEmailBodyTemplate',
				'Shesha.Otp.DefaultLifetime',
				'Shesha.Otp.DefaultEmailSubjectTemplate',
				'Shesha.Otp.DefaultSubjectTemplate',
				'Shesha.Otp.DefaultBodyTemplate',
				'Shesha.Sms.SmsGateway'
			)	
	)");

            Execute.Sql(@"delete 
from 
	Frwk_ConfigurationItems 
where
	ModuleId is null 
	and ItemType = 'setting-configuration'
	and Name in (
		'Shesha.Push.PushNotifier',
		'Shesha.Otp.IgnoreOtpValidation',
		'Shesha.Otp.Alphabet',
		'Shesha.Sms.RedirectAllMessagesTo',
		'Shesha.Otp.PasswordLength',
		'Shesha.Otp.DefaultEmailBodyTemplate',
		'Shesha.Otp.DefaultLifetime',
		'Shesha.Otp.DefaultEmailSubjectTemplate',
		'Shesha.Otp.DefaultSubjectTemplate',
		'Shesha.Otp.DefaultBodyTemplate',
		'Shesha.Sms.SmsGateway'
	)	");
        }
    }
}
