using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623121099)]
    public class M20250623121099 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Column("description").OnTable("configuration_item_folders").InSchema("frwk").AsStringMax().NotNullable().WithDefaultValue(string.Empty);
            Alter.Column("name").OnTable("configuration_item_folders").InSchema("frwk").AsString(300).NotNullable();

            Alter.Column("name").OnTable("modules").InSchema("frwk").AsString(300).NotNullable();

            Execute.Sql(@"create or alter view frwk.vw_configuration_items_tree_nodes as 
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
		cast(null as nvarchar(50)) as item_type
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
		ci.item_type
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
		ci.item_type
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
	item_type
from 
	finalCte");

			Execute.Sql(@"create or alter view frwk.vw_configuration_items_nodes as
select 
	 ci.id,
	 2 /*configuration item*/ as node_type,
	 ci.module_id,
	 ci.folder_id
from
	frwk.configuration_items ci
where
	ci.is_deleted = 0

union all 

select 
	 f.id,
	 3 /*folder*/ as node_type,
	 f.module_id,
	 f.parent_id as folder_id
from
	frwk.configuration_item_folders f
where
	f.is_deleted = 0");
        }
    }
}
