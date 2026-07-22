using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251218141099)]
    public class M20251218141099 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"create view frwk.vw_reflist_live_items as
select
	item.id as item_id,
	module.name as module,
	ci.name as name,
	item.item_value as item_value,
	item.item as item
from
    frwk.reference_list_items item
    inner join frwk.reference_lists list on list.id = item.reference_list_id
    inner join frwk.configuration_items ci on ci.id = list.id
	inner join frwk.modules module on module.id = ci.module_id
where
	ci.is_deleted = 0");

            IfDatabase("PostgreSql").Execute.Sql(@"create view frwk.vw_reflist_live_items as
select
	item.id as item_id,
	module.name as module,
	ci.name as name,
	item.item_value as item_value,
	item.item as item
from
    frwk.reference_list_items item
    inner join frwk.reference_lists list on list.id = item.reference_list_id
    inner join frwk.configuration_items ci on ci.id = list.id
	inner join frwk.modules module on module.id = ci.module_id
where
	ci.is_deleted = false");
        }
    }
}
