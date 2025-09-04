INSERT INTO frwk.role_permissions
           (id
           ,creation_time
           ,creator_user_id
           ,last_modification_time
           ,last_modifier_user_id
           ,is_deleted
           ,deletion_time
           ,deleter_user_id
           ,tenant_id
           ,is_granted
           ,permission
           ,role_revision_id)
SELECT 
	Id
    ,CreationTime
    ,CreatorUserId
    ,LastModificationTime
    ,LastModifierUserId
    ,IsDeleted
    ,DeletionTime
    ,DeleterUserId
    ,TenantId
    ,IsGranted
	,Permission
    ,ShaRoleId
FROM Core_ShaRolePermissions
