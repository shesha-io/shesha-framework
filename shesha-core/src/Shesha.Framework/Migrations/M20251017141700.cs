using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251017141700)]
    public class M20251017141700 : OneWayMigration
    {
        public override void Up()
        {

            // Rename duplicates after change Entities namespaces

            Execute.Sql(@"
with aa as (
    select
        ci.id,
        ci.module_id,
        ec.class_name,
        ci.creation_time,
        row_number() over (partition by ec.class_name, ci.module_id order by ci.creation_time desc) as rn,
        count(1) over (partition by ec.class_name, ci.module_id) as cou
    from frwk.configuration_items ci
    inner join frwk.entity_configs ec on ec.id = ci.id
    where ci.item_type = 'entity'
)
update frwk.entity_configs set class_name = concat(class_name, '_')
where id in (select id from aa where cou > 1 and rn > 1)
");

            // Remove duplicates after change Entities namespaces

            var sql = @"with aa as (
	select
		ci.module_id,
		ec.class_name,
		count(1) as cou
	from 
		frwk.configuration_items ci
		inner join frwk.entity_configs ec on ec.id = ci.id
	where ci.item_type = 'entity'
	group by ci.module_id, ec.class_name
), bb as (
	select
		min(ci.creation_time) creation,
		ec.class_name
	from 
		frwk.configuration_items ci
		inner join frwk.entity_configs ec on ec.id = ci.id
		inner join aa on aa.class_name = ec.class_name and (aa.module_id = ci.module_id or aa.module_id is null and ci.module_id is null)
	where 
		aa.cou > 1
	group by ec.class_name
), cc as (
	select
		ci.id
	from 
		frwk.configuration_items ci
		inner join frwk.entity_configs ec on ec.id = ci.id
		inner join bb on bb.class_name = ec.class_name and ci.creation_time = bb.creation
)
UPDATE 
    frwk.configuration_items 
SET 
    is_deleted = @del@
FROM 
    cc
WHERE 
    frwk.configuration_items.id = cc.id";

            IfDatabase("SqlServer").Execute.Sql(sql.Replace("@del@", "1"));
            IfDatabase("PostgreSql").Execute.Sql(sql.Replace("@del@", "true"));

            // Rename all Entities configuration_items Name to ClassName

            IfDatabase("SqlServer").Execute.Sql(@"
update ci
set ci.name = ec.class_name
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
where ci.item_type = 'entity'");

            IfDatabase("PostgreSql").Execute.Sql(@"
update frwk.configuration_items ci
set name = ec.class_name
from frwk.entity_configs ec
where ec.id = ci.id and ci.item_type = 'entity'");            
        }
    }
}