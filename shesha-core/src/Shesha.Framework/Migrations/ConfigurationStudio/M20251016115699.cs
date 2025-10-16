using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251016115699)]
    public class M20251016115699 : OneWayMigration
    {
        public override void Up()
		{
            // is_enabled was not used earlier
            IfDatabase("SqlServer").Execute.Sql(@"update frwk.modules set is_enabled = 1");
            IfDatabase("PostgreSql").Execute.Sql(@"update frwk.modules set is_enabled = true");

            IfDatabase("SqlServer").Execute.Sql(@"create or alter view frwk.vw_configuration_items_inheritance as
with cte as (
	-- Anchor member: root node(s)
	select 
		ci.id,
		ci.exposed_from_id,
		ci.name,
		ci.item_type,
		ci.module_id as module_id,
		ci.module_id as override_module_id
	from 
		frwk.configuration_items ci 
		
	where
		(ci.exposed_from_id is null or ci.surface_status = 2)
		and ci.is_deleted = 0

	union all
	
	-- Recursive member: child nodes
	select 
		ci.id,
		ci.exposed_from_id,
		ci.name,
		ci.item_type,
		c.module_id,
		ci.module_id as override_module_id
	from 
		frwk.configuration_items ci 
		inner join  cte c ON ci.exposed_from_id = c.id and ci.surface_status = 2 /*Overridden*/
	where
		ci.is_deleted = 0
)
select 
	(m.name + '/' + cte.name + ':' + cast(coalesce(rel.level, 999) as varchar)) as id,
	cte.id as item_id,
	cte.name,
	cte.item_type,
	cte.module_id,
	m.name as module_name,
	cte.override_module_id as exposed_in_module_id,
	om.name as exposed_in_module_name,
	coalesce(rel.level, 999) as module_level
from 
	cte
	left join frwk.module_relations rel on rel.module_id = frwk.get_module_id() and rel.base_module_id = cte.override_module_id
	inner join frwk.modules m on m.id = cte.module_id and m.is_deleted = 0
	inner join frwk.modules om on om.id = cte.override_module_id and om.is_deleted = 0");

            IfDatabase("PostgreSql").Execute.Sql(@"create or replace view frwk.vw_configuration_items_inheritance as
with recursive cte as (
	-- Anchor member: root node(s)
	select 
		ci.id,
		ci.exposed_from_id,
		ci.name,
		ci.item_type,
		ci.module_id as module_id,
		ci.module_id as override_module_id
	from 
		frwk.configuration_items ci 
	where
		(ci.exposed_from_id is null or ci.surface_status = 2)
		and ci.is_deleted = false
	union all
	-- Recursive member: child nodes
	select 
		ci.id,
		ci.exposed_from_id,
		ci.name,
		ci.item_type,
		c.module_id,
		ci.module_id as override_module_id
	from 
		frwk.configuration_items ci 
		inner join  cte c ON ci.exposed_from_id = c.id and ci.surface_status = 2 /*Overridden*/
	where
		ci.is_deleted = false
)
select 
	concat(m.name, '/', cte.name, ':', coalesce(rel.level, 999)) as id,
	cte.id as item_id,
	cte.name,
	cte.item_type,
	cte.module_id,
	m.name as module_name,
	cte.override_module_id as exposed_in_module_id,
	om.name as exposed_in_module_name,
	coalesce(rel.level, 999) as module_level
from 
	cte
	left join frwk.module_relations rel on rel.module_id = frwk.get_module_id() and rel.base_module_id = cte.override_module_id
	inner join frwk.modules m on m.id = cte.module_id and m.is_deleted = fasle
	inner join frwk.modules om on om.id = cte.override_module_id and om.is_deleted = fasle");
        }
    }
}
