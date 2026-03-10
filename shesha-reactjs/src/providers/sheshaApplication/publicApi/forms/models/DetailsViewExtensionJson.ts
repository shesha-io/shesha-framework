import { IEntityTypeIdentifier } from "../../entities/models";

export interface DetailsViewExtensionJson {
  modelType: string | IEntityTypeIdentifier;
  showKeyInformationBar: boolean;
  keyInformationBarProperties: string[];
  addChildTables: boolean;
  childTablesList: string[];
}
