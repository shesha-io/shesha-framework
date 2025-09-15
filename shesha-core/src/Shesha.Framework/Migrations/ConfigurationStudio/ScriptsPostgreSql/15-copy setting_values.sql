with data as (
	SELECT 
		sv."Id"
		,sv."CreationTime"
		,sv."CreatorUserId"
		,sv."LastModificationTime"
		,sv."LastModifierUserId"
		,sv."Value"
		,sv."ApplicationId"
		,(select id from frwk.configuration_items where item_type = 'setting-configuration' and name = ci."Name" and module_id = ci."ModuleId") ci_id
		,sv."UserId"
	FROM 
		"Frwk_SettingValues" sv
		inner join "Frwk_ConfigurationItems" ci on ci."Id" = sv."SettingConfigurationId"
),
dataLatest as (
	select 
		*
	from 
		data
	where
		not exists (
			select 
				1 
			from 
				data prev
			where
				data.ci_id = prev.ci_id
				and data."UserId" = prev."UserId"
				and data."ApplicationId" = prev."ApplicationId"
				and prev."CreationTime" > data."CreationTime"
		)
)
INSERT INTO frwk.setting_values
           (id
           ,creation_time
           ,creator_user_id
           ,last_modification_time
           ,last_modifier_user_id
           ,value
           ,application_id
           ,setting_configuration_id
           ,user_id)
SELECT "Id"
      ,"CreationTime"
      ,"CreatorUserId"
      ,"LastModificationTime"
      ,"LastModifierUserId"
      ,"Value"
      ,"ApplicationId"
	  ,ci_id
      ,"UserId"
FROM dataLatest
