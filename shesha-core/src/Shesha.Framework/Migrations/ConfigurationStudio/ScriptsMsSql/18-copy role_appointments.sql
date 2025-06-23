INSERT INTO frwk.role_appointments
	(id
	,creation_time
	,creator_user_id
	,last_modification_time
	,last_modifier_user_id
	,is_deleted
	,deletion_time
	,deleter_user_id
	,frwk_discriminator
	,permissioned_entity1_id
	,permissioned_entity1_class_name
	,permissioned_entity1_display_name
	,permissioned_entity2_id
	,permissioned_entity2_class_name
	,permissioned_entity2_display_name
	,permissioned_entity3_id
	,permissioned_entity3_class_name
	,permissioned_entity3_display_name
	,from_date
	,to_date
	,status_lkp
	,person_id
	,role_id)
SELECT
	app.Id
	,app.CreationTime
	,app.CreatorUserId
	,app.LastModificationTime
	,app.LastModifierUserId
	,app.IsDeleted
	,app.DeletionTime
	,app.DeleterUserId
	,app.Frwk_Discriminator
	,app.PermissionedEntity1Id
	,app.PermissionedEntity1ClassName
	,app.PermissionedEntity1DisplayName
	,app.PermissionedEntity2Id
	,app.PermissionedEntity2ClassName
	,app.PermissionedEntity2DisplayName
	,app.PermissionedEntity3Id
	,app.PermissionedEntity3ClassName
	,app.PermissionedEntity3DisplayName
	,app.FromDate
	,app.ToDate
	,app.StatusLkp
	,app.PersonId
	,(select 
		Id 
	from 
		frwk.configuration_items 
	where 
		item_type = 'role' 
		and name = ci.Name 
		and (module_id = ci.ModuleId or module_id is null and ci.ModuleId is null)) ci_id
FROM 
	Core_ShaRoleAppointments app
	inner join Frwk_ConfigurationItems ci on ci.id = app.RoleId