using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251101113101)]
    public class M20251101113101 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
alter table frwk.entity_configs add full_class_name as (concat(coalesce(namespace, ''), '.', coalesce(class_name, ''))) PERSISTED
");

            IfDatabase("PostgreSql").Execute.Sql(@"
alter table frwk.entity_configs add full_class_name citext GENERATED ALWAYS AS (concat(coalesce(namespace, ''), '.', coalesce(class_name, ''))) stored
");
            Alter.Table("entity_properties").InSchema("frwk").AddColumn("entity_module").AsString(300).Nullable();
            Alter.Table("entity_properties").InSchema("frwk").AddColumn("entity_full_class_name").AsString(1000).Nullable();

            // Move entity_type to entity_full_class_name
            Execute.Sql("update frwk.entity_properties set entity_full_class_name = entity_type");

            // Update entity_module and entity_type for using {module}:{name} format
            IfDatabase("SqlServer").Execute.Sql(@"
update ep set ep.entity_type = ec.class_name, ep.entity_module = m.name
from frwk.entity_properties ep
inner join frwk.configuration_items ci on ci.id = ep.entity_config_id --and ci.is_deleted = 0
inner join frwk.entity_configs ec on concat(coalesce(ec.namespace, ''), '.', coalesce(ec.class_name, '')) = ep.entity_type or ec.type_short_alias = ep.entity_type
left join frwk.configuration_items cec on cec.id = ec.id --and cec.is_deleted = 0
left join frwk.modules m on m.id = cec.module_id
where 
	not ep.entity_type is null and ep.entity_type != ''
	and (ep.data_type in ('entity', 'file') or ep.data_format in ('entity', 'file', 'interface'))
");

            IfDatabase("PostgreSql").Execute.Sql(@"
UPDATE frwk.entity_properties 
SET entity_type = ec.class_name, entity_module = m.name
FROM frwk.configuration_items ci
INNER JOIN frwk.entity_configs ec ON (
    CONCAT(COALESCE(ec.namespace, ''), '.', COALESCE(ec.class_name, '')) = frwk.entity_properties.entity_type
    OR ec.type_short_alias = frwk.entity_properties.entity_type
)
LEFT JOIN frwk.configuration_items cec ON cec.id = ec.id 
LEFT JOIN frwk.modules m ON m.id = cec.module_id
WHERE 
    ci.id = frwk.entity_properties.entity_config_id
    AND frwk.entity_properties.entity_type IS NOT NULL 
    AND frwk.entity_properties.entity_type != ''
    AND (frwk.entity_properties.data_type IN ('entity', 'file') OR frwk.entity_properties.data_format IN ('entity', 'file', 'interface'))
");

        }
    }
}
