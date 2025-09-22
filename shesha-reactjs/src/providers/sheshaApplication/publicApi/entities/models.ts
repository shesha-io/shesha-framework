export interface EntityApiItem {
  name: string;
  description?: string;
  accessor: string;
}

export interface DataTypeInfo {
  dataType: string;
  dataFormat?: string;
  objectType?: string;
}

export interface EntityConfigurationDto extends EntityApiItem {
  module: EntityApiItem;
  entityType: EntityApiItem;
}

export interface IEntityTypeIndentifier {
  module: string | null;
  name: string;
}

export interface IEntity<TId = string> {
  id: TId;
};
