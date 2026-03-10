INSERT INTO frwk.notification_channel_revisions
           (id
           ,default_priority_lkp
           ,max_message_size
           ,sender_type_name
           ,status_lkp
           ,supported_format_lkp
           ,supported_mechanism_lkp
           ,supports_attachment)
select 
	cio.Id
	,ncc.DefaultPriorityLkp
	,ncc.MaxMessageSize
	,ncc.SenderTypeName
	,ncc.StatusLkp
	,ncc.SupportedFormatLkp
	,ncc.SupportedMechanismLkp
	,ncc.SupportsAttachment
from
	Frwk_ConfigurationItems cio
	inner join Core_NotificationChannelConfigs ncc on cio.Id = ncc.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType