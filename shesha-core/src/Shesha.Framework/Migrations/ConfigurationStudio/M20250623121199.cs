using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623121199)]
    public class M20250623121199 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"update frwk.entity_properties set min_length = null where min_length = 0");
            Execute.Sql(@"update frwk.entity_config_revisions set properties_md5 = null");

			IfDatabase("SqlServer").Execute.Sql(@"create or alter view frwk.vw_configuration_items_to_expose as
select 
	ci.id,
	m.name as origin_module_name, 
	null as override_module_name,
	ci.name,
	ci.item_type,
	ci.last_modification_time as date_updated
from 
	frwk.configuration_items ci
	inner join frwk.modules m on m.id = ci.module_id
where
	ci.is_deleted = 0
	and ci.exposed_from_id is null
	and m.is_enabled = 1
union all
select 
	ci.id,
	base_m.name as origin_module_name, 
	m.name as override_module_name,
	ci.name,
	ci.item_type,
	ci.last_modification_time as date_updated
from 
	frwk.configuration_items ci
	inner join frwk.modules m on m.id = ci.module_id
	inner join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id
where
	ci.is_deleted = 0
	and m.is_enabled = 1");

			IfDatabase("PostgreSql").Execute.Sql(@"create or replace view frwk.vw_configuration_items_to_expose as
select 
	ci.id,
	m.name as origin_module_name, 
	null as override_module_name,
	ci.name,
	ci.item_type,
	ci.last_modification_time as date_updated
from 
	frwk.configuration_items ci
	inner join frwk.modules m on m.id = ci.module_id
where
	ci.is_deleted = false
	and ci.exposed_from_id is null
	and m.is_enabled = true
union all
select 
	ci.id,
	base_m.name as origin_module_name, 
	m.name as override_module_name,
	ci.name,
	ci.item_type,
	ci.last_modification_time as date_updated
from 
	frwk.configuration_items ci
	inner join frwk.modules m on m.id = ci.module_id
	inner join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id
where
	ci.is_deleted = false
	and m.is_enabled = true");
        }
    }
}
