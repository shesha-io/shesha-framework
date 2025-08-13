INSERT INTO frwk.notification_type_revisions
           (id
           ,allow_attachments
           ,can_opt_out
           ,category
           ,disable
           ,is_time_sensitive
           ,order_index
           ,override_channels)
select 
	cio.Id
	,ntc.Core_AllowAttachments
	,ntc.Core_CanOptOut
	,ntc.Core_Category
	,ntc.Core_Disable
	,ntc.Core_IsTimeSensitive
	,ntc.Core_OrderIndex
	,ntc.Core_OverrideChannels
from
	Frwk_ConfigurationItems cio
	inner join Core_NotificationTypeConfigs ntc on cio.Id = ntc.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType     