using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120599)]
    public class M20250623120599 : OneWayMigration
    {
        public override void Up()
        {
			IfDatabase("SqlServer").Execute.Sql(@"CREATE OR ALTER VIEW frwk.vw_permissioned_objects_full
AS
with not_deleted as (
	select 
		id
		,creation_time
		,creator_user_id
		,last_modification_time
		,last_modifier_user_id
		,is_deleted
		,deletion_time
		,deleter_user_id
		,access_lkp
		,category
		,description
		,hardcoded
		,hidden
		,md5
		,name
		,object
		,parent
		,permissions
		,type
		,module_id 
	from 
		frwk.permissioned_objects 
	where 
		is_deleted = 0 
),
all_data as (
	select
		po.*,
		access_lkp as inherited_access_lkp,
		permissions as inherited_permissions
	from 
		not_deleted po 
	where 
		po.parent is null or po.parent = ''
	
	union all

	select
		po.*,
		case when ad.access_lkp = 2 then ad.inherited_access_lkp else ad.access_lkp end as inherited_access_lkp,
		case when ad.access_lkp = 2 then ad.inherited_permissions else ad.permissions end as inherited_permissions
	from 
		not_deleted po
		join all_data ad on ad.object = po.parent
)
select 
	ad.*,
	m.name as module_name,
	case when ad.access_lkp = 2 then ad.inherited_access_lkp else ad.access_lkp end as actual_access_lkp,
	case when ad.access_lkp = 2 then ad.inherited_permissions else ad.permissions end as actual_permissions
from 
	all_data ad
	left join frwk.modules m on m.id = ad.module_id");

            IfDatabase("SqlServer").Execute.Sql(@"create view frwk.vw_reference_list_item_values as
select
    m.name as module,
    ci.name,
    item.item,
    item.item_value
from
	frwk.configuration_items ci 
	inner join frwk.reference_list_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.modules m on m.id = ci.module_id
    inner join frwk.reference_list_items item on item.reference_list_revision_id = rev.id and item.is_deleted = 0
where
    ci.is_deleted = 0
	and ci.item_type = 'reference-list'");

            IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR replace VIEW frwk.vw_permissioned_objects_full
AS
with recursive not_deleted as (
	select 
		id
		,creation_time
		,creator_user_id
		,last_modification_time
		,last_modifier_user_id
		,is_deleted
		,deletion_time
		,deleter_user_id
		,access_lkp
		,category
		,description
		,hardcoded
		,hidden
		,md5
		,name
		,object
		,parent
		,permissions
		,type
		,module_id 
	from 
		frwk.permissioned_objects 
	where 
		is_deleted = false 
),
all_data as (
	select
		po.*,
		access_lkp as inherited_access_lkp,
		permissions as inherited_permissions
	from 
		not_deleted po 
	where 
		po.parent is null or po.parent = ''
	
	union all

	select
		po.*,
		case when ad.access_lkp = 2 then ad.inherited_access_lkp else ad.access_lkp end as inherited_access_lkp,
		case when ad.access_lkp = 2 then ad.inherited_permissions else ad.permissions end as inherited_permissions
	from 
		not_deleted po
		join all_data ad on ad.object = po.parent
)
select 
	ad.*,
	m.name as module_name,
	case when ad.access_lkp = 2 then ad.inherited_access_lkp else ad.access_lkp end as actual_access_lkp,
	case when ad.access_lkp = 2 then ad.inherited_permissions else ad.permissions end as actual_permissions
from 
	all_data ad
	left join frwk.modules m on m.id = ad.module_id");

			IfDatabase("PostgreSql").Execute.Sql(@"create view frwk.vw_reference_list_item_values as
select
    m.name as module,
    ci.name,
    item.item,
    item.item_value
from
	frwk.configuration_items ci 
	inner join frwk.reference_list_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.modules m on m.id = ci.module_id
    inner join frwk.reference_list_items item on item.reference_list_revision_id = rev.id and item.is_deleted = false
where
    ci.is_deleted = false
	and ci.item_type = 'reference-list'");

            Execute.Sql(@"drop function ""Frwk_GetRefListItem""");
            Execute.Sql(@"drop function ""Frwk_GetMultiValueRefListItemNames""");

			Execute.Sql(@"update 
	frwk.entity_properties 
set 
	entity_type = replace(entity_type, 'Shesha.Domain.ConfigurationItems.', 'Shesha.Domain.') 
where 
	entity_type like 'Shesha.Domain.ConfigurationItems.%'");
        }
    }
}
