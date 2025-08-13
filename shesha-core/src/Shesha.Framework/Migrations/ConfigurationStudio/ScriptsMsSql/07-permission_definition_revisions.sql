INSERT INTO frwk.permission_definition_revisions
           (id
           ,parent)
select 
	cio.Id
	,pd.Parent
from
	Frwk_ConfigurationItems cio
	inner join Frwk_PermissionDefinitions pd on cio.Id = pd.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType