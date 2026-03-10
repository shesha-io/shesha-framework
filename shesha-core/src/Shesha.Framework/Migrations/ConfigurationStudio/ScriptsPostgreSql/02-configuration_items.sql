INSERT INTO frwk.configuration_items
           (id
           ,creation_time
           ,creator_user_id
           ,last_modification_time
           ,last_modifier_user_id
           ,is_deleted
           ,deletion_time
           ,deleter_user_id
           ,active_revision_id
           ,item_type
           ,latest_revision_id
           ,name
           ,suppress
           ,surface_status
           ,application_id
           ,exposed_from_revision_id
           ,folder_id
           ,module_id
           ,origin_id)
select 
	"Id",
	"CreationTime",
	"CreatorUserId",
	"LastModificationTime",
	"LastModifierUserId",
	"IsDeleted",
	"DeletionTime",
	"DeleterUserId",
	null,
	"ItemType",
	null,
	"Name",
	"Suppress",
	null,
	"ApplicationId",
	null,
	null,
	"ModuleId",
	null
from
	"Frwk_ConfigurationItems" ci
where
	not exists (
		select 
			1 
		from 
			"Frwk_ConfigurationItems" ci2
		where
			(ci2."ModuleId" = ci."ModuleId" or (ci2."ModuleId" is null and ci."ModuleId" is null))
			and ci2."Name" = ci."Name"
			and ci2."ItemType" = ci."ItemType"
			and ci2."CreationTime" > ci."CreationTime"
	)
     