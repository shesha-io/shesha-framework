INSERT INTO frwk.role_revisions
           (id
           ,hard_link_to_application
           ,name_space)
select 
	cio."Id"
	,r."HardLinkToApplication"
	,r."NameSpace"
from
	"Frwk_ConfigurationItems" cio
	inner join "Core_ShaRoles" r on cio."Id" = r."Id"
	inner join frwk.configuration_items cin on 
		cin.name = cio."Name"
		and (cin.module_id = cio."ModuleId" or cin.module_id is null and cio."ModuleId" is null)
		and cin.item_type = cio."ItemType"