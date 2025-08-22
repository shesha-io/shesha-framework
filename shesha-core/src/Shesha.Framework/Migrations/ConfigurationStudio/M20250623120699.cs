using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120699)]
    public class M20250623120699 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"create or alter procedure frwk.set_ci_mode
	@mode varchar(20)
AS
BEGIN
	EXEC sp_set_session_context 'app.ci_mode', @mode, @read_only = 0;
END");
			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE PROCEDURE frwk.set_ci_mode(
    mode varchar(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM set_config('app.ci_mode', mode, false /*false - applies to session*/);
END;
$$;");

            IfDatabase("SqlServer").Execute.Sql(@"create or alter function frwk.get_ci_mode()
RETURNS varchar(20)
AS
BEGIN
	DECLARE @result varchar(20);

	select @result = coalesce(cast(SESSION_CONTEXT(N'app.ci_mode') as varchar(20)), 'latest')

	RETURN @result;
END");

			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION frwk.get_ci_mode()
RETURNS varchar(20)
LANGUAGE plpgsql
AS $$
DECLARE
    result varchar(20);
BEGIN
    result := COALESCE( current_setting('app.ci_mode', true), 'latest' );
    
    RETURN result;
END;
$$;");

            IfDatabase("SqlServer").Execute.Sql(@"alter table frwk.configuration_items add revision_id as (case when frwk.get_ci_mode() = 'published' and active_revision_id is not null then active_revision_id else latest_revision_id end)");
            IfDatabase("PostgreSql").Execute.Sql(@"alter table frwk.configuration_items add column revision_id uuid generated always as (coalesce(active_revision_id , latest_revision_id)) stored");

            IfDatabase("SqlServer").Execute.Sql(@"create unique index 
	uq_frwk_configuration_items_module_name
on 
	frwk.configuration_items(name, module_id, application_id, item_type)
where 
	is_deleted = 0");
            IfDatabase("PostgreSql").Execute.Sql(@"create unique index 
	uq_frwk_configuration_items_module_name
on 
	frwk.configuration_items(name, module_id, application_id, item_type)
where 
	is_deleted = false");

            IfDatabase("SqlServer").Execute.Sql(@"create or ALTER view frwk.vw_configuration_items_overrides as 
select 
	exp_ci.id,
	exp_ci.item_type,
	exp_ci.name as name, 
	exp_m.id as module_id,
	exp_m.name as module_name,
	exp_ci.active_revision_id,
	exp_ci.latest_revision_id,
	exp_ci.revision_id,

	base_ci.name as base_name,
	base_m.id as base_module_id,
	base_m.name as base_module_name
from 
	frwk.configuration_items exp_ci
	inner join frwk.modules exp_m on exp_m.id = exp_ci.module_id
	inner join frwk.configuration_item_revisions base_rev on base_rev.id = exp_ci.exposed_from_revision_id
	inner join frwk.configuration_items base_ci on base_ci.id = base_rev.configuration_item_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id
where
	exp_ci.exposed_from_revision_id is not null
	and exp_ci.surface_status = 2 /*Overridden*/
");

            IfDatabase("PostgreSql").Execute.Sql(@"create or replace view frwk.vw_configuration_items_overrides as 
select 
	exp_ci.id,
	exp_ci.item_type,
	exp_ci.name as name, 
	exp_m.id as module_id,
	exp_m.name as module_name,
	exp_ci.active_revision_id,
	exp_ci.latest_revision_id,
	exp_ci.revision_id,

	base_ci.name as base_name,
	base_m.id as base_module_id,
	base_m.name as base_module_name
from 
	frwk.configuration_items exp_ci
	inner join frwk.modules exp_m on exp_m.id = exp_ci.module_id
	inner join frwk.configuration_item_revisions base_rev on base_rev.id = exp_ci.exposed_from_revision_id
	inner join frwk.configuration_items base_ci on base_ci.id = base_rev.configuration_item_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id
where
	exp_ci.exposed_from_revision_id is not null
	and exp_ci.surface_status = 2 /*Overridden*/
");
        }
    }
}
