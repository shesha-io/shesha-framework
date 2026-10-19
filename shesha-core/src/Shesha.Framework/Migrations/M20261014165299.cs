using FluentMigrator;
using Shesha.FluentMigrator;
using System.Collections.Generic;

namespace Shesha.Migrations
{
    [Migration(20261014165299)]
    public class M20261014165299 : OneWayMigration
    {
        public override void Up()
        {
            var newNames = new Dictionary<string, string>{
                { "app:Configurator", "Application-Configure" },
                { "pages:applicationSettings", "Application-Settings" },
                { "pages:maintenance", "Application-Maintenance" },
                { "Pages.Hangfire", "Hangfire-Dashboard" },
                { "Pages.Users", "User-Manage" },
                { "users:resetPassword", "User-ResetPassword" },
                { "Pages.Roles", "Role-Manage" },
                { "pages:shaRoles", "Role-Manage" },                
                { "pages:persons", "Person-View" },                
            };
            var useLegacyTables = Schema.Table("Core_ShaRolePermissions").Exists();
            foreach (var (oldName, newName) in newNames)
            {
                if (useLegacyTables)
                    RenamePermissionLegacy(oldName, newName);
                else
                    RenamePermission(oldName, newName);
            }
        }

        private void RenamePermissionLegacy(string oldName, string newName)
        {
            Execute.Sql($"update \"Core_ShaRolePermissions\" set \"Permission\" = '{newName}' where \"Permission\" = '{oldName}'");
            Execute.Sql($@"update
	""Frwk_FormConfigurations""
set
	""Markup"" = replace(""Markup"", '""{oldName}""', '""{newName}""') 
where
	""Markup"" like '%""{oldName}""%'");

            Execute.Sql($@"update
	""Frwk_SettingValues""
set
	""Value"" = replace(""Value"", '""{oldName}""', '""{newName}""') 
where
	""Id"" in (
		select 
			sv.""Id""
		from 
			""Frwk_SettingValues"" sv
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = sv.""SettingConfigurationId""
		where
			ci.""Name"" = 'Shesha.MainMenuSettings'
			and sv.""Value"" like '%""{oldName}""%'
	)");
        }

        private void RenamePermission(string oldName, string newName)
        {
            Execute.Sql($"update frwk.role_permissions set permission = '{newName}' where permission = '{oldName}'");
            Execute.Sql($@"update
	frwk.form_configurations
set
	markup = replace(markup, '""{oldName}""', '""{newName}""') 
where
	markup like '%""{oldName}""%'");

            Execute.Sql($@"update
	frwk.setting_values
set
	value = replace(value, '""{oldName}""', '""{newName}""') 
where
	id in (
		select 
			sv.id
		from 
			frwk.setting_values sv
			inner join frwk.configuration_items ci on ci.id = sv.setting_configuration_id
		where
			ci.name = 'Shesha.MainMenuSettings'
			and sv.value like '%""{oldName}""%'
	)");
        }
    }
}
