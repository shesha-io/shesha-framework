INSERT INTO frwk.entity_property_values
	(id
	,creation_time
	,creator_user_id
	,last_modification_time
	,last_modifier_user_id
	,is_deleted
	,deletion_time
	,deleter_user_id
	,tenant_id
	,frwk_owner_id
	,frwk_owner_type
	,value
	,entity_property_id)
SELECT "Id"
	,"CreationTime"
	,"CreatorUserId"
	,"LastModificationTime"
	,"LastModifierUserId"
	,"IsDeleted"
	,"DeletionTime"
	,"DeleterUserId"
	,"TenantId"
	,"Frwk_OwnerId"
	,"Frwk_OwnerType"
	,"Value"
	,"EntityPropertyId"
FROM "Frwk_EntityPropertyValues"
