using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20260202111799)]
    public class M20260202111799 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"update frwk.configuration_items 
set
	latest_imported_revision_id = null,
	latest_revision_id = null
where 
	id in (
		select 
			ci.id 
		from 
			frwk.configuration_items ci
			inner join frwk.form_configurations fc on fc.id = ci.id
			inner join frwk.modules m on m.id = ci.module_id
		where
			m.name = 'Shesha'	
	)");
            Execute.Sql(@"delete from frwk.configuration_item_revisions where configuration_item_id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.form_configurations fc on fc.id = ci.id
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'	
)");
            Execute.Sql(@"delete from frwk.form_configurations where id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.form_configurations fc on fc.id = ci.id
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'
)");
            Execute.Sql(@"delete from frwk.configuration_items where id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'
		and ci.item_type = 'form'
)");
        }
    }
}
