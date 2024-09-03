using FluentMigrator;
using Shesha.Configuration;
using Shesha.FluentMigrator;
using static Castle.MicroKernel.ModelBuilder.Descriptors.InterceptorDescriptor;

namespace Shesha.Migrations
{
    [Migration(20240807181900)]
    public class M20240807181900 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
insert into Frwk_FrontEndApps (id, Name, Description, AppKey) values (NEWID(), 'Default UI', 'Default frontend application', 'default-app')
");

            IfDatabase("SqlServer").Execute.Sql(@"
update Frwk_SettingValues set ApplicationId = (select fe.id from Frwk_FrontEndApps fe where fe.AppKey = 'default-app')
where ApplicationId is null and SettingConfigurationId in 
    (select sc.id from Frwk_SettingConfigurations sc 
        inner join Frwk_ConfigurationItems ci on ci.id = sc.id and ci.Name in ('Shesha.MainMenuSettings', 'Shesha.ThemeSettings'))
");
        }
    }
}
