import { PropertyMetadataDto } from "@/apis/metadata";

export interface EntityMetadataDto {
  dataType?: string;
  module?: string;
  typeAccessor?: string;
  moduleAccessor?: string;
  properties?: PropertyMetadataDto[] | null;
}
