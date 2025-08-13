INSERT INTO frwk.setting_config_revisions
           (id
           ,access_mode
           ,category
           ,client_access_lkp
           ,data_type
		   ,data_format
           ,editor_form_module
           ,editor_form_name
           ,is_client_specific
           ,is_user_specific
           ,order_index)
select 
	cio.Id
	,sc.AccessModeLkp
	,sc.Category
	,sc.ClientAccessLkp
	,sc.DataType
	,sc.DataFormat
	,sc.EditorFormModule
	,sc.EditorFormName
	,sc.IsClientSpecific
	,sc.IsUserSpecific
	,sc.OrderIndex	
from
	Frwk_ConfigurationItems cio
	inner join Frwk_SettingConfigurations sc on cio.Id = sc.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType