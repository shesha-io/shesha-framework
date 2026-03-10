INSERT INTO frwk.entity_configs
           (id
           ,class_name
           ,discriminator_value
           ,entity_config_type_lkp
           ,namespace
           ,table_name
		   ,id_column
		   ,created_in_db
		   ,inherited_from_id
		   )
select 
	cio.Id
	,ec.ClassName
	,ec.DiscriminatorValue
	,ec.EntityConfigTypeLkp
	,ec.Namespace
	,ec.TableName
	,ec.IdColumn
	,ec.CreatedInDb
	,ec.InheritedFromId
from
	Frwk_ConfigurationItems cio
	inner join Frwk_EntityConfigs ec on cio.Id = ec.Id
	inner join frwk.configuration_items cin on 
		cin.name = cio.Name
		and (cin.module_id = cio.ModuleId or cin.module_id is null and cio.ModuleId is null)
		and cin.item_type = cio.ItemType