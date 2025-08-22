INSERT INTO frwk.configuration_item_revisions
           (id
           ,creation_time
           ,creator_user_id
           ,last_modification_time
           ,last_modifier_user_id
           ,is_deleted
           ,deletion_time
           ,deleter_user_id
           ,comments
           ,config_hash
           ,description
           ,is_compressed
           ,label
           ,version_name
           ,version_no
           ,frwk_discriminator
           ,configuration_item_id
           ,created_by_import_id
           ,parent_revision_id)
select 
	cio."Id"
	,cio."CreationTime"
	,cio."CreatorUserId"
	,cio."LastModificationTime"
	,cio."LastModifierUserId"
	,cio."IsDeleted"
	,cio."DeletionTime"
	,cio."DeleterUserId"
	,null
	,null
	,cio."Description"
	,false
	,cio."Label"
	,null
	,cio."VersionNo"
	,cio."ItemType"
	,cin.id
	,cio."CreatedByImportId"
	,cio."ParentVersionId"
from
	"Frwk_ConfigurationItems" cio
	inner join frwk.configuration_items cin on 
		cin.name = cio."Name"
		and (cin.module_id = cio."ModuleId" or cin.module_id is null and cio."ModuleId" is null)
		and cin.item_type = cio."ItemType"