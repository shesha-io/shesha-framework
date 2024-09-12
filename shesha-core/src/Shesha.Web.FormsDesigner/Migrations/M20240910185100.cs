using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20240910185100)]
    public class M20240910185100 : OneWayMigration
    {
        public override void Up()
        {
                IfDatabase("sqlserver").Execute.Sql(@"
update fc set Markup = REPLACE(fc.Markup, 'user-management-details-new', 'user-management-details')
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems ci on ci.id = fc.id and ci.IsLast = 1 and IsDeleted = 0 and ci.ModuleId = (select id from Frwk_Modules where Name = 'Shesha')
");

            IfDatabase("sqlserver").Execute.Sql(@"
update fc set Markup = REPLACE(fc.Markup, 'user-management-create-new', 'user-management-create')
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems ci on ci.id = fc.id and ci.IsLast = 1 and IsDeleted = 0 and ci.ModuleId = (select id from Frwk_Modules where Name = 'Shesha')
");

            IfDatabase("sqlserver").Execute.Sql(@"
update fc set Markup = REPLACE(fc.Markup, 'user-management-new', 'user-management-table')
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems ci on ci.id = fc.id and ci.IsLast = 1 and IsDeleted = 0 and ci.ModuleId = (select id from Frwk_Modules where Name = 'Shesha')
");

            IfDatabase("sqlserver").Execute.Sql(@"
update sv set Value = REPLACE(sv.Value, 'user-management-new', 'user-management-table')
from Frwk_SettingValues sv
inner join Frwk_SettingConfigurations sc on sc.id = sv.SettingConfigurationId
inner join Frwk_ConfigurationItems ci on ci.id = sc.id and ci.IsLast = 1 and ci.IsDeleted = 0 and ci.Name = 'Shesha.MainMenuSettings' and ci.ModuleId = (select id from Frwk_Modules where Name = 'Shesha')
");

        }
    }
}
