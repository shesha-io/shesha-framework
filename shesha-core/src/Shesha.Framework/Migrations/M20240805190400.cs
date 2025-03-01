using FluentMigrator;
using Shesha.Configuration;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240805190400)]
    public class M20240805190400 : OneWayMigration
    {
        public override void Up()
        {
            this.Shesha().SettingCreate(SheshaSettingNames.MainMenuSettings, "Main menu settings")
                .IsClientSpecific()
                .AsComplexObject("Shesha.Configuration.MainMenuSettings")
                .WithEditForm("Shesha", "main-menu-settings")
                .WithCategory("Frontend");

            IfDatabase("SqlServer").Execute.Sql(@"
insert into Frwk_SettingValues (id, SettingConfigurationId, Value, ApplicationId)
select NEWID(), (select cii.id from Frwk_ConfigurationItems cii where cii.name = 'Shesha.MainMenuSettings'), cc.Settings, ci.ApplicationId
from Frwk_ConfigurableComponents cc
inner join Frwk_ConfigurationItems ci on ci.id = cc.id
where ci.name like '%sidebar-menu%' and ItemType = 'configurable-component' and ci.IsLast = 1
");
            IfDatabase("PostgreSql").Execute.Sql(@"
insert into ""Frwk_SettingValues"" (""Id"", ""SettingConfigurationId"", ""Value"", ""ApplicationId"")
select gen_random_uuid(), (select cii.""Id"" from ""Frwk_ConfigurationItems"" cii where cii.""Name"" = 'Shesha.MainMenuSettings'), cc.""Settings"", ci.""ApplicationId""
from ""Frwk_ConfigurableComponents"" cc
inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = cc.""Id""
where ci.""Name"" like '%sidebar-menu%' and ci.""ItemType"" = 'configurable-component' and ci.""IsLast""
");
        }
    }
}
