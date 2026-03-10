using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250917104299)]
    public class M20250917104299 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"update
	item
set
	reference_list_id = ci.id
from
	frwk.reference_list_items item
	inner join frwk.configuration_item_revisions rev on rev.id = item.reference_list_revision_id
	inner join frwk.configuration_items ci on ci.latest_revision_id = rev.id
where
	item.reference_list_id is null
	and not exists (
		select 
			1 
		from 
			frwk.reference_list_items dup
		where
			dup.reference_list_id = ci.id
			and dup.item_value = item.item_value
			and dup.id <> item.id
	)");

            IfDatabase("PostgreSql").Execute.Sql(@"UPDATE frwk.reference_list_items AS item
SET
    reference_list_id = ci.id
FROM
    frwk.configuration_item_revisions rev
    INNER JOIN frwk.configuration_items ci ON ci.latest_revision_id = rev.id
WHERE
    item.reference_list_revision_id = rev.id
    and item.reference_list_id IS NULL
	and not exists (
		select 
			1 
		from 
			frwk.reference_list_items dup
		where
			dup.reference_list_id = ci.id
			and dup.item_value = item.item_value
			and dup.id <> item.id
	)");

            Execute.Sql("delete from frwk.reference_list_items where reference_list_id is null");

			Delete.ForeignKey("fk_reference_list_items_reference_list_id").OnTable("reference_list_items").InSchema("frwk");
			Delete.Index("IX_reference_list_items_reference_list_id").OnTable("reference_list_items").InSchema("frwk");

            IfDatabase("PostgreSql").Execute.Sql(@"drop view frwk.vw_reference_list_item_values");
            Alter.Column("reference_list_id").OnTable("reference_list_items").InSchema("frwk").AsGuid().NotNullable().Indexed();

            Create.ForeignKey("fk_reference_list_items_reference_list_id")
				.FromTable("reference_list_items").InSchema("frwk").ForeignColumn("reference_list_id")
				.ToTable("reference_lists").InSchema("frwk").PrimaryColumn("id");

            Delete.ForeignKey("fk_reference_list_items_reference_list_revision_id").OnTable("reference_list_items").InSchema("frwk");
            Delete.Index("IX_reference_list_items_reference_list_revision_id").OnTable("reference_list_items").InSchema("frwk");
            Delete.Column("reference_list_revision_id").FromTable("reference_list_items").InSchema("frwk");

            IfDatabase("PostgreSql").Execute.Sql(@"create or replace view frwk.vw_reference_list_item_values as
select
    m.name as module,
    ci.name,
    item.item,
    item.item_value
from
	frwk.configuration_items ci 
	inner join frwk.modules m on m.id = ci.module_id
    inner join frwk.reference_list_items item on item.reference_list_id = ci.id and item.is_deleted = false
where
    ci.is_deleted = false
	and ci.item_type = 'reference-list'");

            Delete.ForeignKey("fk_entity_properties_entity_config_revision_id").OnTable("entity_properties").InSchema("frwk");
            Delete.Index("IX_entity_properties_entity_config_revision_id").OnTable("entity_properties").InSchema("frwk");
            Delete.Column("entity_config_revision_id").FromTable("entity_properties").InSchema("frwk");

            Delete.Column("revision_id").FromTable("configuration_items").InSchema("frwk");

            Delete.ForeignKey("fk_configuration_items_active_revision_id").OnTable("configuration_items").InSchema("frwk");
            Delete.Index("IX_configuration_items_active_revision_id").OnTable("configuration_items").InSchema("frwk");
            Delete.Column("active_revision_id").FromTable("configuration_items").InSchema("frwk");

            Execute.Sql(@"delete
from 
	frwk.role_permissions
where
	role_id is null
	and role_revision_id is null");

            Delete.ForeignKey("fk_role_permissions_role_revision_id").OnTable("role_permissions").InSchema("frwk");
            Delete.Index("IX_role_permissions_role_revision_id").OnTable("role_permissions").InSchema("frwk");
            Delete.Column("role_revision_id").FromTable("role_permissions").InSchema("frwk");

            Delete.ForeignKey("fk_role_permissions_role_id").OnTable("role_permissions").InSchema("frwk");
            Delete.Index("IX_role_permissions_role_id").OnTable("role_permissions").InSchema("frwk");
            Alter.Column("role_id").OnTable("role_permissions").InSchema("frwk")
                .AsGuid().NotNullable()
                .ForeignKey("fk_role_permissions_role_id", "frwk", "roles", "id").Indexed();

            Execute.Sql(@"update frwk.entity_configs set source_lkp = 1 /*ApplicationCode*/ where source_lkp is null");
            Alter.Column("source_lkp").OnTable("entity_configs").InSchema("frwk").AsInt64().NotNullable().WithDefaultValue(1 /*ApplicationCode*/);

            Execute.Sql(@"delete from frwk.role_appointments where role_id is null");
            Delete.ForeignKey("fk_role_appointments_role_id").OnTable("role_appointments").InSchema("frwk");
            Delete.Index("IX_role_appointments_role_id").OnTable("role_appointments").InSchema("frwk");
            Alter.Column("role_id").OnTable("role_appointments").InSchema("frwk")
                .AsGuid().NotNullable()
                .ForeignKey("fk_role_appointments_role_id", "frwk", "roles", "id").Indexed();
        }
    }
}