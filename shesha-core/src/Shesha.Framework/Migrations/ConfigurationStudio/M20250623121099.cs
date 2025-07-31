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

            Create.Column("order_index").OnTable("configuration_items").InSchema("frwk").AsDouble().Nullable();
            Create.Column("order_index").OnTable("configuration_item_folders").InSchema("frwk").AsDouble().Nullable();

            Execute.Sql(@"with new_order as (
	select 
		f.id,
		f.order_index,
		row_number() over (partition by f.parent_id order by f.name) new_order_index
	from 
		frwk.configuration_item_folders f
)
update
	new_order
set
	order_index = new_order_index");

            Execute.Sql(@"with new_order as (
	select 
		ci.id,
		ci.order_index,
		row_number() over (partition by ci.module_id, ci.folder_id order by ci.name) new_order_index
	from 
		frwk.configuration_items ci
)
update
	new_order
set
	order_index = new_order_index");

			Execute.Sql(@"create or alter trigger trg_configuration_items_order_index_ai
ON frwk.configuration_items
after insert
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update only rows that were inserted with NULL OrderIndex
	with new_order as (
		select 
			ci.id,
			ci.order_index,
			calc.max_order_index + row_number() over (partition by ci.module_id, ci.folder_id order by ci.creation_time) new_order_index
		from 
			frwk.configuration_items ci
			inner join inserted i ON ci.id = i.id and i.order_index is null
			cross apply (
				select 
					isnull(max(existing.order_index), 0) AS max_order_index
				from 
					frwk.configuration_items existing
				where 
					(existing.module_id = i.module_id or existing.module_id is null and i.module_id is null)
					and (existing.folder_id = i.folder_id or existing.folder_id is null and i.folder_id is null)
			) calc
	)
	update
		new_order
	set
		order_index = new_order_index;
END");

            Execute.Sql(@"create unique index uq_configuration_items_order_index on frwk.configuration_items(module_id, folder_id, order_index) where is_deleted=0 and order_index is not null");
            Execute.Sql(@"create unique index uq_configuration_item_folders_order_index on frwk.configuration_item_folders(module_id, order_index) where is_deleted=0");

            Execute.Sql(@"create or alter view frwk.vw_configuration_items_tree_nodes as 
with foldersCte as (
	select
		f.id,
		f.module_id as parent_id,
		f.module_id,
		f.name,
		f.order_index
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
		f.name,
		f.order_index
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
		1 /*module*/ as node_type,
		cast(0.0 as float) as order_index
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
		3 /*folder*/ as node_type,
		f.order_index
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
		tn.order_index
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
		ci.order_index
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
		ci.order_index
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
	order_index
from 
	finalCte");

			Execute.Sql(@"create or alter view frwk.vw_configuration_items_nodes as
select 
	 ci.id,
	 2 /*configuration item*/ as node_type,
	 ci.order_index,
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
	 f.order_index,
	 f.module_id,
	 f.parent_id as folder_id
from
	frwk.configuration_item_folders f
where
	f.is_deleted = 0");
        }
    }
}
