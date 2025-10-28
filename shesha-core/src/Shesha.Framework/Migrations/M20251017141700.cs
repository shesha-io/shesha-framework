using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251017141700)]
    public class M20251017141700 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"with aa as (
select
ci.module_id,
ec.class_name,
count(1) as cou
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
where ci.item_type = 'entity'
group by ci.module_id, ec.class_name
), bb as (
select
min(ci.creation_time) creation,
ec.class_name
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
inner join aa on aa.class_name = ec.class_name and (aa.module_id = ci.module_id or aa.module_id is null and ci.module_id is null)
where aa.cou > 1
group by ec.class_name
), cc as (
select
ci.id
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
inner join bb on bb.class_name = ec.class_name and ci.creation_time = bb.creation
)
update ecc set class_name = ecc.class_name + '_'
from frwk.entity_configs ecc
inner join cc on cc.id = ecc.id");

            var sql = @"with aa as (
select
ci.module_id,
ec.class_name,
count(1) as cou
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
where ci.item_type = 'entity'
group by ci.module_id, ec.class_name
), bb as (
select
min(ci.creation_time) creation,
ec.class_name
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
inner join aa on aa.class_name = ec.class_name and (aa.module_id = ci.module_id or aa.module_id is null and ci.module_id is null)
where aa.cou > 1
group by ec.class_name
), cc as (
select
ci.id
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
inner join bb on bb.class_name = ec.class_name and ci.creation_time = bb.creation
)
update cii set is_deleted = @del@
from frwk.configuration_items cii
inner join cc on cc.id = cii.id";

            IfDatabase("SqlServer").Execute.Sql(sql.Replace("@del@", "1"));
            IfDatabase("PostgreSql").Execute.Sql(sql.Replace("@del@", "true"));

            Execute.Sql(@"update ci set
name = ec.class_name
from frwk.configuration_items ci
inner join frwk.entity_configs ec on ec.id = ci.id
where ci.item_type = 'entity'");

            Insert.ForceBootstrapper("EntityConfigsBootstrapper");
        }
    }
}