using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623164299)]
    public class M20250623164299 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("is_code_based").OnTable("configuration_items").InSchema("frwk").AsBoolean().NotNullable().SetExistingRowsTo(false);
            Create.Column("is_codegen_pending").OnTable("configuration_items").InSchema("frwk").AsBoolean().NotNullable().SetExistingRowsTo(false);

            Alter.Table("configuration_items").InSchema("frwk")
                .AddColumn("latest_imported_revision_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_latest_imported_revision_id", "frwk", "configuration_item_revisions", "id").Indexed();

            Execute.Sql("alter table frwk.configuration_items add is_updated as cast((case when latest_imported_revision_id is not null and latest_imported_revision_id = latest_revision_id then 0 else 1 end) as bit) persisted");
            Execute.Sql("alter table frwk.configuration_items add is_exposed as cast((case when exposed_from_id is not null then 1 else 0 end) as bit) persisted");

            Execute.Sql(@"update
	frwk.configuration_items
set
	latest_imported_revision_id = (
		select 
		top 1
			id
		from
			frwk.configuration_item_revisions rev
		where
			rev.configuration_item_id = frwk.configuration_items.id
			and rev.created_by_import_id is not null
		order by rev.creation_time desc
	)");
            Execute.Sql(@"alter view frwk.vw_configuration_items_tree_nodes as 
with foldersCte as (
	select
		f.id,
		f.module_id as parent_id,
		f.module_id,
		f.name
	from
		frwk.configuration_item_folders f
	where
		f.parent_id is null
		and f.is_deleted = 0

	union all

	select
		f.id,
		f.parent_id,
		f.module_id,
		f.name
	from
		frwk.configuration_item_folders f
		inner join foldersCte c ON f.parent_id = c.id
	where
		f.is_deleted = 0
), modulesCte as (
	select
		m.id,
		cast(null as uniqueidentifier) as parent_id,
		m.id as module_id,
		m.name,
		cast (m.friendly_name as varchar(300)) as label,
		1 /*module*/ as node_type
	from
		frwk.modules m
	where
		m.is_deleted = 0
		and m.is_editable = 1
		and m.is_enabled = 1

	union all

	select
		f.id,
		f.parent_id,
		f.module_id,
		f.name,
		cast (f.name as varchar(300)) as label,
		3 /*folder*/ as node_type
	from
		foldersCte f
		inner join modulesCte c ON f.module_id = c.id
), finalCte as (
	select 
		tn.id,
		tn.parent_id,
		tn.module_id,
		cast(tn.name as varchar(300)) as name,
		tn.label,
		tn.node_type,
		cast(null as nvarchar(50)) as item_type,
		cast (0 as bit) as is_exposed,
		cast (0 as bit) as is_code_based,
		cast (0 as bit) as is_updated,
		cast (0 as bit) as is_codegen_pending,
		cast (null as bigint) as last_modifier_user_id
	from
		modulesCte tn

	union all

	select
		ci.id,
		ci.module_id as parent_id,
		ci.module_id,
		cast(ci.name as varchar(300)) as name,
		cast(ci.name as varchar(300)) as label,
		2 /*configuration item*/ as node_type,
		ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id		
	from
		frwk.configuration_items ci
		inner join finalCte c on ci.module_id = c.id and c.node_type = 1 /*module*/
	where
		ci.folder_id is null
		and ci.is_deleted = 0

	union all

	select
		ci.id,
		ci.folder_id as parent_id,
		ci.module_id,
		cast(ci.name as varchar(300)) as name,
		cast(ci.name as varchar(300)) as label,
		2 /*configuration item*/ as node_type,
		ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id		
	from
		frwk.configuration_items ci
		inner join finalCte c on ci.module_id = c.module_id and ci.folder_id = c.id and c.node_type = 3 /*folder*/
	where
		ci.is_deleted = 0
)
select 
	id,
	parent_id,
	module_id,
	name,
	label,
	node_type,
	item_type,
	is_exposed,
	is_code_based,
	is_updated,
	is_codegen_pending,
	last_modifier_user_id
from 
	finalCte
");
        }
    }
}
