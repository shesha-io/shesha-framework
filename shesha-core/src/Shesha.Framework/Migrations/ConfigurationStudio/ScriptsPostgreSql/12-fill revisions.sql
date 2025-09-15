update 
	frwk.configuration_items
set
	latest_revision_id = (
		select
			"Id"
		from
			"Frwk_ConfigurationItems" cio
		where
			cio."Name" = frwk.configuration_items.Name
			and (cio."ModuleId" = frwk.configuration_items.module_id or cio."ModuleId" is null and frwk.configuration_items.module_id is null)
			and cio."ItemType" = frwk.configuration_items.item_type
			and cio."IsLast" = true
		order by cio."IsDeleted"
		limit 1
	),
	active_revision_id = (
		select
			"Id"
		from
			"Frwk_ConfigurationItems" cio
		where
			cio."Name" = frwk.configuration_items.Name
			and (cio."ModuleId" = frwk.configuration_items.module_id or cio."ModuleId" is null and frwk.configuration_items.module_id is null)
			and cio."ItemType" = frwk.configuration_items.item_type
			and cio."VersionStatusLkp" = 3 /*Live*/
		order by cio."IsDeleted"
		limit 1
	)