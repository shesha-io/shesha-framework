export enum PackageItemStatus {
  Unchanged = 1,
  New = 2,
  Updated = 3,
  Error = 4,
};

export type PackageItemDto = {
  id: string;
  name: string;
  label?: string;
  description?: string;
  status: PackageItemStatus;
  statusDescription?: string;
  type: string;
  dateUpdated?: Date;
  baseModule: string;
  overrideModule?: string;
};

export type PackageAnalyzeResult = {
  items: PackageItemDto[];
};

export type AnalyzePackageResponse = PackageAnalyzeResult;
