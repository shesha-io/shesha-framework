with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,
				frev.markup as Markup,
				frev.model_type as ModelType,
				null as TemplateId,
				frev.is_template as IsTemplate,
				p.access_lkp as Access,
				(SELECT JSON_QUERY('[' + STRING_AGG('"' + TRIM(value) + '"', ',') + ']') FROM STRING_SPLIT(p.permissions, ',')) as Permissions
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.form_configuration_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
		outer apply (select top 1 * from frwk.permissioned_objects po where po.type = 'Shesha.Form' and po.object = coalesce(m.name, '') + '.' + ci.name) p
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,

				frev.data_type as DataType,
				frev.editor_form_name as EditorFormName,
				frev.editor_form_module as EditorFormModule,
				frev.order_index as OrderIndex,
				frev.category as Category,
				frev.is_client_specific as IsClientSpecific,
				frev.access_mode as AccessMode,
				frev.client_access_lkp as ClientAccess,
				frev.is_user_specific as IsUserSpecific				
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.setting_config_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

CREATE OR ALTER FUNCTION frwk.reflist_items_tree (@rev_id uniqueidentifier, @parent_id uniqueidentifier)
RETURNS NVARCHAR(MAX)
AS
BEGIN
    DECLARE @ChildrenJson NVARCHAR(MAX);
    
    -- Get direct children
    WITH AllChilds as (
		SELECT
			item.id,
			parent_id,
			reference_list_revision_id,

			item.item as Item,
			item.item_value as ItemValue,
			item.description as Description,
			item.order_index as OrderIndex,
			item.hard_link_to_application as HardLinkToApplication,
			item.color as Color,
			item.icon as Icon,
			item.short_alias as ShortAlias
		FROM
			frwk.reference_list_items item
	), DirectChildren AS (
        SELECT 
			*
        FROM 
			AllChilds p
        WHERE 
			(p.parent_id = @parent_id or @parent_id is null and p.parent_id is null)
			and p.reference_list_revision_id = @rev_id
    )
    SELECT @ChildrenJson = (
        SELECT 
			dc.Item,
			dc.ItemValue,
			dc.Description,
			dc.OrderIndex,
			dc.HardLinkToApplication,
			dc.Color,
			dc.Icon,
			dc.ShortAlias,
            -- Recursively get grandchildren
            JSON_QUERY(frwk.reflist_items_tree(@rev_id, dc.id)) AS ChildItems
        FROM DirectChildren dc
        ORDER BY dc.ItemValue
        FOR JSON PATH
    );
    
    RETURN @ChildrenJson;
END;
go

with allItems as (
    SELECT
		item.id,
		parent_id,
		reference_list_revision_id,

        item.item as Item,
		item.item_value as ItemValue,
		item.description as Description,
		item.order_index as OrderIndex,
		item.hard_link_to_application as HardLinkToApplication,
		item.color as Color,
		item.icon as Icon,
		item.short_alias as ShortAlias
    FROM
        frwk.reference_list_items item
)
,data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,
				(select json_query(
					(select frwk.reflist_items_tree (rev.id, null))
				)) as Items
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.reference_list_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,

				frev.allow_attachments as AllowAttachments,
				frev.disable as Disable,
				frev.can_opt_out as CanOptOut,
				frev.category as Category,
				0 as OrderIndex,
				frev.override_channels as OverrideChannels,
				frev.is_time_sensitive as IsTimeSensitive,
				(
					select
						t.id as Id,
						t.MessageFormatLkp as MessageFormat,
						t.TitleTemplate as TitleTemplate,
						t.BodyTemplate as BodyTemplate						
					from
						Core_NotificationTemplates t
					FOR JSON PATH
				) as Templates
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.notification_type_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,

				frev.supported_format_lkp as SupportedFormat,
				frev.max_message_size as MaxMessageSize,
				frev.supported_mechanism_lkp as SupportedMechanism,
				frev.sender_type_name as SenderTypeName,
				frev.default_priority_lkp as DefaultPriority,
				frev.status_lkp as Status
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.notification_channel_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,

				frev.name_space as NameSpace,
				frev.hard_link_to_application as HardLinkToApplication,
				(
				select
					p.is_granted as IsGranted,
					p.permission as Permission
				from
					frwk.role_permissions p
				where
					p.role_revision_id = frev.id
				FOR JSON PATH
				) as Permissions
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.role_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,

				frev.parent as Parent				
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.permission_definition_revisions frev on frev.id = rev.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

update frwk.configuration_items set active_revision_id = null, latest_revision_id = null, latest_imported_revision_id = null where item_type = 'configurable-component'
go
delete from frwk.configuration_item_revisions where configuration_item_id in (
	select id from frwk.configuration_items where item_type = 'configurable-component'
)
go
delete from frwk.configuration_items where item_type = 'configurable-component'
go

CREATE OR ALTER FUNCTION frwk.entity_config_properties_tree (@rev_id uniqueidentifier, @parent_id uniqueidentifier)
RETURNS NVARCHAR(MAX)
AS
BEGIN
    DECLARE @ChildrenJson NVARCHAR(MAX);
    
    -- Get direct children
    WITH AllChilds as (
		SELECT
			p.id,
			p.parent_property_id,
			p.entity_config_revision_id,
			p.items_type_id,

			p.name as Name,
			p.label as Label,
			p.description as Description,
			p.data_type as DataType,
			p.data_format as DataFormat,
			p.entity_type as EntityType,
			p.reference_list_name as ReferenceListName,
			p.reference_list_module as ReferenceListModule,
			p.source_lkp as Source,
			p.sort_order as SortOrder,
			p.is_framework_related as IsFrameworkRelated,
			p.suppress as Suppress,
			p.required as Required,
			p.read_only as ReadOnly,
			p.audited as Audited,
			p.min as Min,
			p.max as Max,
			p.min_length as MinLength,
			p.max_length as MaxLength,
			p.reg_exp as RegExp,
			p.validation_message as ValidationMessage,
			p.cascade_create as CascadeCreate,
			p.cascade_update as CascadeUpdate,
			p.cascade_delete_unreferenced as CascadeDeleteUnreferenced
        FROM 
			frwk.entity_properties p
	), DirectChildren AS (
        SELECT 
			*
        FROM 
			AllChilds p
        WHERE 
			(p.parent_property_id = @parent_id or @parent_id is null and p.parent_property_id is null)
			and p.entity_config_revision_id = @rev_id
    )
    SELECT @ChildrenJson = (
        SELECT 
			dc.Name,
			dc.Label,
			dc.Description,
			dc.DataType,
			dc.DataFormat,
			dc.EntityType,
			dc.ReferenceListName,
			dc.ReferenceListModule,
			dc.Source,
			dc.SortOrder,
			dc.IsFrameworkRelated,
			dc.Suppress,
			dc.Required,
			dc.ReadOnly,
			dc.Audited,
			dc.Min,
			dc.Max,
			dc.MinLength,
			dc.MaxLength,
			dc.RegExp,
			dc.ValidationMessage,
			dc.CascadeCreate,
			dc.CascadeUpdate,
			dc.CascadeDeleteUnreferenced,

			--p.items_type_id as ItemsType,
			(select JSON_QUERY((
				select 
					it.Name,
					it.Label,
					it.Description,
					it.DataType,
					it.DataFormat,
					it.EntityType,
					it.ReferenceListName,
					it.ReferenceListModule,
					it.Source,
					it.SortOrder,
					it.IsFrameworkRelated,
					it.Suppress,
					it.Required,
					it.ReadOnly,
					it.Audited,
					it.Min,
					it.Max,
					it.MinLength,
					it.MaxLength,
					it.RegExp,
					it.ValidationMessage,
					it.CascadeCreate,
					it.CascadeUpdate,
					it.CascadeDeleteUnreferenced
				from
					AllChilds it
				where
					it.id = dc.items_type_id
				FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
			))) as ItemsType,
            -- Recursively get grandchildren
            JSON_QUERY(frwk.entity_config_properties_tree(@rev_id, dc.id)) AS Properties
        FROM DirectChildren dc
        ORDER BY dc.name
        FOR JSON PATH
    );
    
    RETURN @ChildrenJson;
END;
go

with data as (
	select 
		rev.id,
		(
			select
				frev.id as Id,
				ci.origin_id as OriginId,
				ci.name as Name,
				rev.label as Label,
				rev.description as Description,
				ci.item_type as ItemType,
				m.name as ModuleName,
				app.name as FrontEndApplication,
				ci.suppress as Suppress,
				frev.type_short_alias as TypeShortAlias,
				ec.schema_name as SchemaName,
				ec.table_name as TableName,
				ec.class_name as ClassName,
				ec.namespace as Namespace,
				ec.discriminator_value as DiscriminatorValue,
				frev.generate_app_service as GenerateAppService,
				frev.source_lkp as Source,
				ec.entity_config_type_lkp as EntityConfigType,
				frev.properties_md5 as PropertiesMD5,
				(select json_query(
					(select frwk.entity_config_properties_tree (rev.id, null))
				)) as Properties
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) as configuration_json
	from
		frwk.configuration_items ci
		inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
		inner join frwk.entity_config_revisions frev on frev.id = rev.id
		inner join frwk.entity_configs ec on ec.id = ci.id
		left join frwk.modules m on m.id = ci.module_id
		left join frwk.front_end_apps app on app.id = ci.application_id
)
update
	rev
set
	configuration_json = data.configuration_json
from
	frwk.configuration_item_revisions rev
	inner join data on data.id = rev.id
go

drop function frwk.entity_config_properties_tree
go
drop function frwk.reflist_items_tree
go