INSERT INTO frwk.form_configuration_revisions
           (id
           ,is_template
           ,markup
           ,model_type)
select 
	cio."Id"
	,fc."IsTemplate"
	,fc."Markup"
	,fc."ModelType"
from
	"Frwk_ConfigurationItems" cio
	inner join "Frwk_FormConfigurations" fc on cio."Id" = fc."Id"
	inner join frwk.configuration_items cin on 
		cin.name = cio."Name"
		and (cin.module_id = cio."ModuleId" or cin.module_id is null and cio."ModuleId" is null)
		and cin.item_type = cio."ItemType"