using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250908141499)]
    public class M20250908141499 : OneWayMigration
    {
        public override void Up()
        {
			IfDatabase("SqlServer").Execute.Sql(@"update 
	ec
set
	accessor = rev.accessor,
	generate_app_service = rev.generate_app_service,
	properties_md5 = rev.properties_md5,
	source_lkp = rev.source_lkp,
	type_short_alias = rev.type_short_alias,
	view_configurations = rev.view_configurations
from
	frwk.entity_configs ec
	inner join frwk.configuration_items ci on ci.id = ec.id
	inner join frwk.entity_config_revisions rev on rev.id = ci.latest_revision_id
");

            IfDatabase("PostgreSql").Execute.Sql(@"UPDATE frwk.entity_configs AS ec
SET
    accessor = rev.accessor,
    generate_app_service = rev.generate_app_service,
    properties_md5 = rev.properties_md5,
    source_lkp = rev.source_lkp,
    type_short_alias = rev.type_short_alias,
    view_configurations = rev.view_configurations
FROM
    frwk.configuration_items ci
    INNER JOIN frwk.entity_config_revisions rev ON rev.id = ci.latest_revision_id
WHERE
    ci.id = ec.id;");

            Execute.Sql(@"insert into
	frwk.form_configurations
	(id, markup, is_template, model_type)
select 
	ci.id,
	frev.markup,
	frev.is_template,
	frev.model_type
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.form_configuration_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'form'");

            Execute.Sql(@"with data as (
    select
        ci.id,
        rev.label,
        rev.description
    from
        frwk.configuration_items ci
        inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
)
update frwk.configuration_items
set
    label = d.label,
    description = d.description
from data d
where frwk.configuration_items.id = d.id");

            Execute.Sql(@"insert into
	frwk.reference_lists
	(id, hard_link_to_application, namespace, no_selection_value)
select 
	ci.id,
	frev.hard_link_to_application,
	frev.namespace,
	frev.no_selection_value
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.reference_list_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'reference-list'
	and not exists (select 1 from frwk.reference_lists where id = ci.id)");

			IfDatabase("SqlServer").Execute.Sql(@"update
	item
set
	reference_list_id = ci.id
from
	frwk.reference_list_items item
	inner join frwk.configuration_item_revisions rev on rev.id = item.reference_list_revision_id
	inner join frwk.configuration_items ci on ci.latest_revision_id = rev.id
where
	item.reference_list_id is null");

			IfDatabase("PostgreSql").Execute.Sql(@"UPDATE frwk.reference_list_items AS item
SET
    reference_list_id = ci.id
FROM
    frwk.configuration_item_revisions rev
    INNER JOIN frwk.configuration_items ci ON ci.latest_revision_id = rev.id
WHERE
    item.reference_list_revision_id = rev.id
    AND item.reference_list_id IS NULL");

            Execute.Sql(@"update
	frwk.entity_properties
set
	entity_config_id = (
		select 
			rev.configuration_item_id
		from
			frwk.configuration_item_revisions rev
		where
			rev.id = entity_properties.entity_config_revision_id
	)
where
	entity_config_id is null");

            IfDatabase("SqlServer").Execute.Sql(@"insert into
	frwk.setting_configurations
	(id, access_mode, category, client_access_lkp, data_type, data_format, editor_form_module, editor_form_name, is_client_specific, is_user_specific, order_index)
select 
	ci.id,
	coalesce(frev.access_mode, 2 /*Authenticated*/), 
	frev.category, 
	coalesce(frev.client_access_lkp, 2 /*ReadOnly*/), 
	frev.data_type, 
	frev.data_format, 
	frev.editor_form_module, 
	frev.editor_form_name, 
	coalesce(frev.is_client_specific, 0), 
	coalesce(frev.is_user_specific, 0), 
	frev.order_index
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.setting_config_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'setting-configuration'
	and not exists (select 1 from frwk.setting_configurations where id = ci.id)");

			IfDatabase("PostgreSql").Execute.Sql(@"insert into
	frwk.setting_configurations
	(id, access_mode, category, client_access_lkp, data_type, data_format, editor_form_module, editor_form_name, is_client_specific, is_user_specific, order_index)
select 
	ci.id,
	coalesce(frev.access_mode, 2 /*Authenticated*/), 
	frev.category, 
	coalesce(frev.client_access_lkp, 2 /*ReadOnly*/), 
	frev.data_type, 
	frev.data_format, 
	frev.editor_form_module, 
	frev.editor_form_name, 
	coalesce(frev.is_client_specific, false), 
	coalesce(frev.is_user_specific, false), 
	frev.order_index
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.setting_config_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'setting-configuration'
	and not exists (select 1 from frwk.setting_configurations where id = ci.id)");

            Execute.Sql(@"insert into
	frwk.roles
	(id, hard_link_to_application, name_space)
select 
	ci.id,
	frev.hard_link_to_application, 
	frev.name_space
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.role_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'role'
	and not exists (select 1 from frwk.roles where id = ci.id)");

            Execute.Sql(@"update 
	frwk.role_permissions
set
	role_id = (
		select 
			rev.configuration_item_id
		from
			frwk.configuration_item_revisions rev
		where
			rev.id = frwk.role_permissions.role_revision_id
	)");

            Execute.Sql(@"insert into
	frwk.permission_definitions
	(id, parent)
select 
	ci.id,
	frev.parent
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.permission_definition_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'permission-definition'
	and not exists (select 1 from frwk.permission_definitions where id = ci.id)");

            Execute.Sql(@"insert into
	frwk.notification_types
	(id, allow_attachments, can_opt_out, category, disable, is_time_sensitive, override_channels)
select 
	ci.id,
	frev.allow_attachments, 
	frev.can_opt_out, 
	coalesce(frev.category, ''), 
	frev.disable, 
	frev.is_time_sensitive, 
	coalesce(frev.override_channels, '')
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.notification_type_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'notification-type'
	and not exists (select 1 from frwk.notification_types where id = ci.id)");
            
            Execute.Sql(@"insert into
	frwk.notification_templates
	(
	id
	,creation_time
	,creator_user_id
	,last_modification_time
	,last_modifier_user_id
	,is_deleted
	,deletion_time
	,deleter_user_id
	,body_template
	,message_format_lkp
	,title_template
	,part_of_id
	)
select
	t.""Id""
	,t.""CreationTime""
	,t.""CreatorUserId""
	,t.""LastModificationTime""
	,t.""LastModifierUserId""
	,t.""IsDeleted""
	,t.""DeletionTime""
	,t.""DeleterUserId""
	,t.""BodyTemplate""
	,t.""MessageFormatLkp""  
	,t.""TitleTemplate""
	,ci.id
from
	""Core_NotificationTemplates"" t
	inner join frwk.notification_type_revisions rev on rev.id = t.""PartOfId""
	inner join frwk.configuration_items ci on ci.latest_revision_id = t.""Id""");

            Execute.Sql(@"insert into
	frwk.notification_channels
	(id
	,default_priority_lkp
	,max_message_size
	,sender_type_name
	,status_lkp
	,supported_format_lkp
	,supported_mechanism_lkp
	,supports_attachment)
select 
	ci.id,
	frev.default_priority_lkp,
	frev.max_message_size,
	coalesce(frev.sender_type_name, ''),
	frev.status_lkp,
	frev.supported_format_lkp,
	frev.supported_mechanism_lkp,
	frev.supports_attachment
from
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
	inner join frwk.notification_channel_revisions frev on frev.id = ci.latest_revision_id
where
	ci.item_type = 'notification-channel'
	and not exists (select 1 from frwk.notification_channels where id = ci.id)");
        }
    }
}
