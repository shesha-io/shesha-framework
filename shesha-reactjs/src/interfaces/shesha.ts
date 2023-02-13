export interface IEntityReferenceDto {
  _className?: string;
  _displayName?: string;
  id?: string;
}

export interface IReferenceListItemDto {
  item?: string;
  itemValue?: number;
  description?: string;
  orderIndex?: number;
  referenceList?: IEntityReferenceDto;
  id?: string;
}

export interface IReferenceListItemValueDto {
  item?: string;
  itemValue?: number;
}
