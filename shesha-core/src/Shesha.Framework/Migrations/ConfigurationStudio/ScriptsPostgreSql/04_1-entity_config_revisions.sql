INSERT INTO frwk.entity_config_revisions
           (id
           ,accessor
           ,generate_app_service
           ,properties_md5
           ,source_lkp
           ,type_short_alias
           ,view_configurations)
select 
	cio."Id"
	,ec."Accessor"
	,ec."GenerateAppService"
	,ec."PropertiesMD5"
	,ec."SourceLkp"
	,ec."TypeShortAlias"
	,ec."ViewConfigurations"
from
	"Frwk_ConfigurationItems" cio
	inner join "Frwk_EntityConfigs" ec on cio."Id" = ec."Id"
	inner join frwk.configuration_items cin on 
		cin.name = cio."Name"
		and (cin.module_id = cio."ModuleId" or cin.module_id is null and cio."ModuleId" is null)
		and cin.item_type = cio."ItemType"