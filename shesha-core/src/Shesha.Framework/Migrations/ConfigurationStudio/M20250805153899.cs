using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250805153899)]
    public class M20250805153899 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"drop index uq_configuration_item_folders_order_index on frwk.configuration_item_folders");
            Execute.Sql(@"create unique index uq_configuration_item_folders_order_index on frwk.configuration_item_folders(module_id, parent_id, order_index) where is_deleted=0");
            Execute.Sql(@"create or alter trigger trg_configuration_item_folders_order_index_ai
ON frwk.configuration_item_folders
after insert
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update only rows that were inserted with NULL OrderIndex
	with new_order as (
		select 
			f.id,
			f.order_index,
			calc.max_order_index + row_number() over (partition by f.module_id, f.parent_id order by f.creation_time) new_order_index
		from 
			frwk.configuration_item_folders f
			inner join inserted i ON f.id = i.id and i.order_index is null
			cross apply (
				select 
					isnull(max(existing.order_index), 0) AS max_order_index
				from 
					frwk.configuration_item_folders existing
				where 
					(existing.module_id = i.module_id or existing.module_id is null and i.module_id is null)
					and (existing.parent_id = i.parent_id or existing.parent_id is null and i.parent_id is null)
			) calc
	)
	update
		new_order
	set
		order_index = new_order_index;
END");
        }
    }
}
