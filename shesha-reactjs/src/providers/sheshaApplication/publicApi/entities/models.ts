export interface EntityApiItem {
  name: string;
  description?: string;
  accessor: string;
}

export interface DataTypeInfo {
  dataType: string;
  dataFormat?: string | null | undefined;
  objectType?: string | undefined;
}

export interface EntityConfigurationDto extends EntityApiItem {
  module: EntityApiItem;
  fullClassName: string;
}

export interface IEntityTypeIdentifier {
  module: string | null;
  name: string;
}

export interface IEntity<TId = string> {
  id: TId;
};
