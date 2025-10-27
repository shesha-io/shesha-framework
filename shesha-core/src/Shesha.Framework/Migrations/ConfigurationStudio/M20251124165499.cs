using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
	[Migration(20251124165499)]
    public class M20251124165499 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"create view frwk.vw_configuration_item_history_items as
with revisions as (
	select 
		rev.id,
		m.name as module_name,
		m.is_editable,
		ci.name as configuration_item_name,
		rev.configuration_item_id,
		rev.version_no,
		rev.version_name,
		rev.comments,
		rev.config_hash,
		rev.is_compressed,
		rev.creation_method_lkp,
		ass.file_version as dll_version_no,
		rev.creation_time,
		rev.creator_user_id
	from 
		frwk.configuration_item_revisions rev
		inner join frwk.configuration_items ci on ci.id = rev.configuration_item_id
		inner join frwk.modules m on m.id = ci.module_id
		left join frwk.import_results ir on ir.id = rev.created_by_import_id
		left join frwk.application_startup_assemblies ass on ass.id = ir.application_startup_assembly_id
		left join ""AbpUsers"" u on u.""Id"" = rev.creator_user_id
)
select 
	rev.*
from 
	revisions rev

union all

select 
	base_rev.id,
	base_rev.module_name,
	base_rev.is_editable,
	base_rev.configuration_item_name,
	ci.id as configuration_item_id,
	base_rev.version_no,
	base_rev.version_name,
	base_rev.comments,
	base_rev.config_hash,
	base_rev.is_compressed,
	base_rev.creation_method_lkp,
	base_rev.dll_version_no,
	base_rev.creation_time,
	base_rev.creator_user_id	
from 
	frwk.configuration_item_revisions exp_rev
	inner join frwk.configuration_items ci on ci.exposed_from_revision_id = exp_rev.id
	
	inner join revisions base_rev on base_rev.configuration_item_id = exp_rev.configuration_item_id 
		and base_rev.version_no <= exp_rev.version_no");
        }
    }
}
