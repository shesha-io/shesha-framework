-- First update (form configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'Markup', frev.markup,
                'ModelType', frev.model_type,
                'TemplateId', NULL,
                'IsTemplate', frev.is_template,
                'Access', p.access_lkp,
                'Permissions', (
                    SELECT JSON_AGG(TRIM(value))
                    FROM UNNEST(STRING_TO_ARRAY(p.permissions, ',')) AS value
                )
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.form_configuration_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
        LEFT JOIN LATERAL (
            SELECT * FROM frwk.permissioned_objects po 
            WHERE po.type = 'Shesha.Form' 
            AND po.object = COALESCE(m.name, '') || '.' || ci.name
            LIMIT 1
        ) p ON TRUE
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Second update (setting configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'DataType', frev.data_type,
                'EditorFormName', frev.editor_form_name,
                'EditorFormModule', frev.editor_form_module,
                'OrderIndex', frev.order_index,
                'Category', frev.category,
                'IsClientSpecific', frev.is_client_specific,
                'AccessMode', frev.access_mode,
                'ClientAccess', frev.client_access_lkp,
                'IsUserSpecific', frev.is_user_specific
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.setting_config_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Create recursive function for reference list items
CREATE OR REPLACE FUNCTION frwk.reflist_items_tree(_rev_id UUID, _parent_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    children_json JSON;
BEGIN
    WITH DirectChildren AS (
        SELECT
            item.id,
            item.item AS Item,
            item.item_value AS ItemValue,
            item.description AS Description,
            item.order_index AS OrderIndex,
            item.hard_link_to_application AS HardLinkToApplication,
            item.color AS Color,
            item.icon AS Icon,
            item.short_alias AS ShortAlias
        FROM
            frwk.reference_list_items item
        WHERE
            (item.parent_id = _parent_id OR (_parent_id IS NULL AND item.parent_id IS NULL))
            AND item.reference_list_revision_id = _rev_id
    )
    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'Item', dc.Item,
            'ItemValue', dc.ItemValue,
            'Description', dc.Description,
            'OrderIndex', dc.OrderIndex,
            'HardLinkToApplication', dc.HardLinkToApplication,
            'Color', dc.Color,
            'Icon', dc.Icon,
            'ShortAlias', dc.ShortAlias,
            'ChildItems', frwk.reflist_items_tree(_rev_id, dc.id)
        )
    ) INTO children_json
    FROM DirectChildren dc;
    
    RETURN children_json;
END;
$$;

-- Third update (reference list configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'Items', frwk.reflist_items_tree(rev.id, NULL)
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.reference_list_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Fourth update (notification type configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'AllowAttachments', frev.allow_attachments,
                'Disable', frev.disable,
                'CanOptOut', frev.can_opt_out,
                'Category', frev.category,
                'OrderIndex', 0,
                'OverrideChannels', frev.override_channels,
                'IsTimeSensitive', frev.is_time_sensitive,
                'Templates', (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'Id', t."Id",
                            'MessageFormat', t."MessageFormatLkp",
                            'TitleTemplate', t."TitleTemplate",
                            'BodyTemplate', t."BodyTemplate"
                        )
                    )
                    FROM "Core_NotificationTemplates" t
                )
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.notification_type_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Fifth update (notification channel configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'SupportedFormat', frev.supported_format_lkp,
                'MaxMessageSize', frev.max_message_size,
                'SupportedMechanism', frev.supported_mechanism_lkp,
                'SenderTypeName', frev.sender_type_name,
                'DefaultPriority', frev.default_priority_lkp,
                'Status', frev.status_lkp
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.notification_channel_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Sixth update (role configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'NameSpace', frev.name_space,
                'HardLinkToApplication', frev.hard_link_to_application,
                'Permissions', (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'IsGranted', p.is_granted,
                            'Permission', p.permission
                        )
                    )
                    FROM frwk.role_permissions p
                    WHERE p.role_revision_id = frev.id
                )
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.role_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Seventh update (permission definition configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'Parent', frev.parent
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.permission_definition_revisions frev ON frev.id = rev.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Clean up configurable components
UPDATE frwk.configuration_items 
SET active_revision_id = NULL, latest_revision_id = NULL, latest_imported_revision_id = NULL 
WHERE item_type = 'configurable-component';

DELETE FROM frwk.configuration_item_revisions 
WHERE configuration_item_id IN (
    SELECT id FROM frwk.configuration_items WHERE item_type = 'configurable-component'
);

DELETE FROM frwk.configuration_items 
WHERE item_type = 'configurable-component';

-- Create recursive function for entity config properties
CREATE OR REPLACE FUNCTION frwk.entity_config_properties_tree(_rev_id UUID, _parent_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    children_json JSON;
BEGIN
    WITH DirectChildren AS (
        SELECT
            p.*
        FROM 
            frwk.entity_properties p
        WHERE 
            (p.parent_property_id = _parent_id OR (_parent_id IS NULL AND p.parent_property_id IS NULL))
            AND p.entity_config_revision_id = _rev_id
    )
    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'Name', dc.name,
            'Label', dc.label,
            'Description', dc.description,
            'DataType', dc.data_type,
            'DataFormat', dc.data_format,
            'EntityType', dc.entity_type,
            'ReferenceListName', dc.reference_list_name,
            'ReferenceListModule', dc.reference_list_module,
            'Source', dc.source_lkp,
            'SortOrder', dc.sort_order,
            'IsFrameworkRelated', dc.is_framework_related,
            'Suppress', dc.suppress,
            'Required', dc.required,
            'ReadOnly', dc.read_only,
            'Audited', dc.audited,
            'Min', dc.min,
            'Max', dc.max,
            'MinLength', dc.min_length,
            'MaxLength', dc.max_length,
            'RegExp', dc.reg_exp,
            'ValidationMessage', dc.validation_message,
            'CascadeCreate', dc.cascade_create,
            'CascadeUpdate', dc.cascade_update,
            'CascadeDeleteUnreferenced', dc.cascade_delete_unreferenced,
            'ItemsType', (
                SELECT JSON_BUILD_OBJECT(
                    'Name', it.name,
                    'Label', it.label,
                    'Description', it.description,
                    'DataType', it.data_type,
                    'DataFormat', it.data_format,
                    'EntityType', it.entity_type,
                    'ReferenceListName', it.reference_list_name,
                    'ReferenceListModule', it.reference_list_module,
                    'Source', it.source_lkp,
                    'SortOrder', it.sort_order,
                    'IsFrameworkRelated', it.is_framework_related,
                    'Suppress', it.suppress,
                    'Required', it.required,
                    'ReadOnly', it.read_only,
                    'Audited', it.audited,
                    'Min', it.min,
                    'Max', it.max,
                    'MinLength', it.min_length,
                    'MaxLength', it.max_length,
                    'RegExp', it.reg_exp,
                    'ValidationMessage', it.validation_message,
                    'CascadeCreate', it.cascade_create,
                    'CascadeUpdate', it.cascade_update,
                    'CascadeDeleteUnreferenced', it.cascade_delete_unreferenced
                )
                FROM frwk.entity_properties it
                WHERE it.id = dc.items_type_id
            ),
            'Properties', frwk.entity_config_properties_tree(_rev_id, dc.id)
        )
    ) INTO children_json
    FROM DirectChildren dc;
    
    RETURN children_json;
END;
$$;

-- Eighth update (entity config configurations)
WITH data AS (
    SELECT 
        rev.id,
        (
            SELECT JSON_BUILD_OBJECT(
                'Id', frev.id,
                'OriginId', ci.origin_id,
                'Name', ci.name,
                'Label', rev.label,
                'Description', rev.description,
                'ItemType', ci.item_type,
                'ModuleName', m.name,
                'FrontEndApplication', app.name,
                'Suppress', ci.suppress,
                'TypeShortAlias', frev.type_short_alias,
                'SchemaName', ec.schema_name,
                'TableName', ec.table_name,
                'ClassName', ec.class_name,
                'Namespace', ec.namespace,
                'DiscriminatorValue', ec.discriminator_value,
                'GenerateAppService', frev.generate_app_service,
                'Source', frev.source_lkp,
                'EntityConfigType', ec.entity_config_type_lkp,
                'PropertiesMD5', frev.properties_md5,
                'Properties', frwk.entity_config_properties_tree(rev.id, NULL)
            )
        ) AS configuration_json
    FROM
        frwk.configuration_items ci
        INNER JOIN frwk.configuration_item_revisions rev ON rev.configuration_item_id = ci.id
        INNER JOIN frwk.entity_config_revisions frev ON frev.id = rev.id
        INNER JOIN frwk.entity_configs ec ON ec.id = ci.id
        LEFT JOIN frwk.modules m ON m.id = ci.module_id
        LEFT JOIN frwk.front_end_apps app ON app.id = ci.application_id
)
UPDATE frwk.configuration_item_revisions rev
SET configuration_json = data.configuration_json
FROM data
WHERE data.id = rev.id;

-- Drop the functions
DROP FUNCTION IF EXISTS frwk.entity_config_properties_tree(UUID, UUID);
DROP FUNCTION IF EXISTS frwk.reflist_items_tree(UUID, UUID);