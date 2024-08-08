using FluentMigrator;
using Shesha.Configuration;
using Shesha.FluentMigrator;
using static Castle.MicroKernel.ModelBuilder.Descriptors.InterceptorDescriptor;

namespace Shesha.Migrations
{
    [Migration(20240802160400)]
    public class M20240802160400 : OneWayMigration
    {
        public override void Up()
        {
            this.Shesha().SettingCreate(SheshaSettingNames.ThemeSettings, "Theme settings")
                .IsClientSpecific()
                .AsComplexObject(typeof(ThemeSettings).FullName)
                .WithEditForm("Shesha", "theme-settings")
                .WithCategory("Frontend");

            IfDatabase("SqlServer").Execute.Sql(@"
insert into Frwk_SettingValues (id, SettingConfigurationId, Value, ApplicationId)
select NEWID(), (select cii.id from Frwk_ConfigurationItems cii where cii.name = 'Shesha.ThemeSettings'), cc.Settings, ci.ApplicationId
from Frwk_ConfigurableComponents cc
inner join Frwk_ConfigurationItems ci on ci.id = cc.id
where ci.name like '%theme-configuration%' and ItemType = 'configurable-component' and ci.IsLast = 1
");
        }
    }
}
