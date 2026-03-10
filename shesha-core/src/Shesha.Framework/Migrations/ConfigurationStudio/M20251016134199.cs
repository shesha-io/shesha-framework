using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251016134199)]
    public class M20251016134199 : OneWayMigration
    {
        public override void Up()
        {
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
	inner join frwk.modules m on m.id = ci.module_id and m.is_deleted = 0 and m.is_enabled = 1
where
	ci.is_deleted = 0
	and ci.exposed_from_id is null	
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
	inner join frwk.modules m on m.id = ci.module_id and m.is_deleted = 0 and m.is_enabled = 1
	inner join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id
where
	ci.is_deleted = 0");

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
	inner join frwk.modules m on m.id = ci.module_id and m.is_deleted = false and m.is_enabled = true
where
	ci.is_deleted = false
	and ci.exposed_from_id is null	
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
	inner join frwk.modules m on m.id = ci.module_id and m.is_deleted = false and m.is_enabled = true
	inner join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id
where
	ci.is_deleted = false");
        }
    }
}
