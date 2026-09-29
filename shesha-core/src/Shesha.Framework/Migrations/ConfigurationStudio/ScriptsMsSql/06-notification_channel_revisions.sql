DECLARE @DefaultPriorityColumn NVARCHAR(100);

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('Core_NotificationChannelConfigs')
      AND name = 'DefaultPriorityLkp'
)
    SET @DefaultPriorityColumn = 'ncc.DefaultPriorityLkp';
ELSE
    SET @DefaultPriorityColumn = 'NULL';

DECLARE @sql NVARCHAR(MAX) = N'
INSERT INTO frwk.notification_channel_revisions
           (id
           ,default_priority_lkp
           ,max_message_size
           ,sender_type_name
           ,status_lkp
           ,supported_format_lkp
           ,supported_mechanism_lkp
           ,supports_attachment)
SELECT 
    cio.Id,
    ' + @DefaultPriorityColumn + N' AS DefaultPriorityLkp,
    ncc.MaxMessageSize,
    ncc.SenderTypeName,
    ncc.StatusLkp,
    ncc.SupportedFormatLkp,
    ncc.SupportedMechanismLkp,
    ncc.SupportsAttachment
FROM Frwk_ConfigurationItems cio
INNER JOIN Core_NotificationChannelConfigs ncc 
    ON cio.Id = ncc.Id
INNER JOIN frwk.configuration_items cin 
    ON cin.name = cio.Name
    AND (
        cin.module_id = cio.ModuleId 
        OR cin.module_id IS NULL AND cio.ModuleId IS NULL
    )
    AND cin.item_type = cio.ItemType;
';

EXEC sp_executesql @sql;