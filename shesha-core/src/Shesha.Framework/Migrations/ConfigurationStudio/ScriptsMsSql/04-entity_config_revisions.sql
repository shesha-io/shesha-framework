INSERT INTO frwk.entity_config_revisions
           (id
           ,accessor
           ,class_name
           ,discriminator_value
           ,entity_config_type_lkp
           ,friendly_name
           ,generate_app_service
           ,properties_md5
           ,namespace
           ,source_lkp
           ,table_name
           ,type_short_alias
           ,view_configurations)
select 
	cio.Id
	,ec.Accessor
	,ec.ClassName
	,ec.DiscriminatorValue
	,ec.EntityConfigTypeLkp
	,ec.FriendlyName
	,ec.GenerateAppService
	,ec.PropertiesMD5
	,ec.Namespace
	,ec.SourceLkp
	,ec.TableName
	,ec.TypeShortAlias
	,ec.ViewConfigurations
from
	Frwk_ConfigurationItems cio
	inner join Frwk_EntityConfigs ec on cio.Id = ec.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType