INSERT INTO frwk.reference_list_revisions
           (id
           ,hard_link_to_application
           ,namespace
           ,no_selection_value)
select 
	cio.Id
	,rl.HardLinkToApplication
	,rl.Namespace
	,rl.NoSelectionValue
from
	Frwk_ConfigurationItems cio
	inner join Frwk_ReferenceLists rl on cio.Id = rl.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType