insert into frwk.reference_list_items
           (id
           ,creation_time
           ,creator_user_id
           ,last_modification_time
           ,last_modifier_user_id
           ,is_deleted
           ,deletion_time
           ,deleter_user_id
           ,tenant_id
           ,color
           ,description
           ,hard_link_to_application
           ,icon
           ,item
           ,item_value
           ,order_index
           ,short_alias
           ,parent_id
           ,reference_list_revision_id)
select
	"Id"
    ,"CreationTime"
    ,"CreatorUserId"
    ,"LastModificationTime"
    ,"LastModifierUserId"
    ,"IsDeleted"
    ,"DeletionTime"
    ,"DeleterUserId"
    ,"TenantId"
	,coalesce("Color", '')
    ,coalesce("Description", '')
    ,"HardLinkToApplication"
	,coalesce("Icon", '')
    ,coalesce("Item", '')
    ,"ItemValue"
    ,"OrderIndex"
    ,coalesce("ShortAlias", '')
	,"ParentId"
    ,"ReferenceListId"
from "Frwk_ReferenceListItems"
