import { IPropertyMetadata } from "../../interfaces/metadata";

/** Named Data Source */
export interface IDataSource {
  id: string;
  name: string;
  containerType: string;
  items: IPropertyMetadata[];
}
