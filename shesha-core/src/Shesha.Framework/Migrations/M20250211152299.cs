using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20250211152299)]
    public class M20250211152299 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"update 
	sv
set
	Value = replace(replace(replace(sv.value, '""{', '{'), '}""', '}'), '\""', '""')
from 
	Frwk_SettingConfigurations sc
	inner join Frwk_ConfigurationItems ci on ci.Id = sc.Id
	inner join Frwk_Modules m on m.Id = ci.ModuleId
	left join Frwk_SettingValues sv on sv.SettingConfigurationId = ci.Id
where
	ci.IsDeleted = 0
	and ci.IsLast = 1
	and ci.Name = 'Shesha.Notification.Settings'
	and isjson(sv.value) = 1
	and isjson(replace(replace(replace(sv.value, '""{', '{'), '}""', '}'), '\""', '""')) = 1");
        }
    }
}
