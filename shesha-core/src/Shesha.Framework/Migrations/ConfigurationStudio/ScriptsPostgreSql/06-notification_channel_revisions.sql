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
	cio."Id"
	-- M20260614111200 on releases/0.43 moves this column onto Core_NotificationTypeConfigs
	-- and drops it here, so a database fed from that line no longer has it. Reading the row
	-- as jsonb and looking the key up by name means the column is never resolved at parse
	-- time: a missing key simply yields null. The MsSql variant defers it with dynamic SQL,
	-- which has no equivalent here, and these scripts use no dollar-quoted blocks.
	,(to_jsonb(ncc) ->> 'DefaultPriorityLkp')::bigint
	,ncc."MaxMessageSize"
	,ncc."SenderTypeName"
	,ncc."StatusLkp"
	,ncc."SupportedFormatLkp"
	,ncc."SupportedMechanismLkp"
	,ncc."SupportsAttachment"
from
	"Frwk_ConfigurationItems" cio
	inner join "Core_NotificationChannelConfigs" ncc on cio."Id" = ncc."Id"
	inner join frwk.configuration_items cin on 
		cin.name = cio."Name"
		and (cin.module_id = cio."ModuleId" or cin.module_id is null and cio."ModuleId" is null)
		and cin.item_type = cio."ItemType"