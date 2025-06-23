insert into frwk.front_end_apps (
	id
    ,creation_time
    ,creator_user_id
    ,last_modification_time
    ,last_modifier_user_id
    ,is_deleted
    ,deletion_time
    ,deleter_user_id
    ,tenant_id
    ,name
    ,description
    ,app_key
)
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
    ,Name
    ,Description
    ,AppKey
FROM dbo.Frwk_FrontEndApps