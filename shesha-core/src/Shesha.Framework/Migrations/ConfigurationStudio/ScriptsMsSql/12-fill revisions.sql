update 
	frwk.configuration_items
set
	latest_revision_id = (
		select
		top 1
			Id
		from
			Frwk_ConfigurationItems cio
		where
			cio.name = frwk.configuration_items.Name
			and (cio.ModuleId = frwk.configuration_items.module_id or cio.ModuleId is null and frwk.configuration_items.module_id is null)
			and cio.ItemType = frwk.configuration_items.item_type
			and cio.IsLast = 1
		order by cio.IsDeleted
	),
	active_revision_id = (
		select
		top 1
			Id
		from
			Frwk_ConfigurationItems cio
		where
			cio.name = frwk.configuration_items.Name
			and (cio.ModuleId = frwk.configuration_items.module_id or cio.ModuleId is null and frwk.configuration_items.module_id is null)
			and cio.ItemType = frwk.configuration_items.item_type
			and cio.VersionStatusLkp = 3 /*Live*/
		order by cio.IsDeleted
	)