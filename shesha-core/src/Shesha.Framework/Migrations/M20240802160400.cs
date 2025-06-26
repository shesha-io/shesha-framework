using FluentMigrator;
using Shesha.Configuration;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240802160400)]
    public class M20240802160400 : OneWayMigration
    {
        public override void Up()
        {
            this.Shesha().SettingCreate(SheshaSettingNames.ThemeSettings, "Theme settings")
                .IsClientSpecific()
                .AsComplexObject("Shesha.Configuration.ThemeSettings")
                .WithEditForm("Shesha", "theme-settings")
                .WithCategory("Frontend");

            IfDatabase("SqlServer").Execute.Sql(@"
insert into Frwk_SettingValues (id, SettingConfigurationId, Value, ApplicationId)
select NEWID(), (select cii.id from Frwk_ConfigurationItems cii where cii.name = 'Shesha.ThemeSettings'), cc.Settings, ci.ApplicationId
from Frwk_ConfigurableComponents cc
inner join Frwk_ConfigurationItems ci on ci.id = cc.id
where ci.name like '%theme-configuration%' and ItemType = 'configurable-component' and ci.IsLast = 1
");
            IfDatabase("PostgreSql").Execute.Sql(@"
insert into ""Frwk_SettingValues"" (""Id"", ""SettingConfigurationId"", ""Value"", ""ApplicationId"")
select gen_random_uuid(), (select cii.""Id"" from ""Frwk_ConfigurationItems"" cii where cii.""Name"" = 'Shesha.ThemeSettings'), cc.""Settings"", ci.""ApplicationId""
from ""Frwk_ConfigurableComponents"" cc
inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = cc.""Id""
where ci.""Name"" like '%theme-configuration%' and ""ItemType"" = 'configurable-component' and ci.""IsLast""
");

        }
    }
}
