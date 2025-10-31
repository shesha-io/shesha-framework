using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251031194100)]
    public class M20251031194100 : OneWayMigration
    {
        public override void Up()
        {
            Insert.ForceBootstrapper("EntityConfigsBootstrapper");

            IfDatabase("SqlServer").Execute.Sql(@"
insert into frwk.entity_properties (
	id, name, data_type, column_name, is_framework_related,
	entity_config_id, audited, cascade_create, cascade_delete_unreferenced,
	cascade_update, read_only, required, source_lkp,suppress
)
select
	NEWID(), 'Id', 'guid', 'id', 1,
	ec.id, 1, 0, 0,
	0, 0, 0, ec.source_lkp, 0
from frwk.entity_configs ec
inner join frwk.configuration_items ci on ci.id = ec.id and ci.is_deleted = 0
where 
	ec.entity_config_type_lkp = 1
	and not exists (select 1 from frwk.entity_properties ep where ep.is_deleted = 0 and ep.entity_config_id = ci.id and ep.name = 'id')
");

            IfDatabase("PostgreSql").Execute.Sql(@"
INSERT INTO frwk.entity_properties (
    id, name, data_type, column_name, is_framework_related, 
    entity_config_id, audited, cascade_create, cascade_delete_unreferenced, 
    cascade_update, read_only, required, source_lkp, suppress
)
SELECT
    gen_random_uuid(), 'Id', 'guid',  'id',  TRUE, 
    ec.id, TRUE, FALSE, FALSE, 
    FALSE, FALSE, FALSE, ec.source_lkp, FALSE
FROM frwk.entity_configs ec
INNER JOIN frwk.configuration_items ci ON ci.id = ec.id AND ci.is_deleted = FALSE
WHERE 
    ec.entity_config_type_lkp = 1
    AND NOT EXISTS (SELECT 1 FROM frwk.entity_properties ep WHERE ep.is_deleted = FALSE AND ep.entity_config_id = ci.id AND ep.name = 'id');
");
        }
    }
}
