import { IEntityTypeIndentifier } from "../../entities/models";

export interface DetailsViewExtensionJson {
  modelType: string | IEntityTypeIndentifier;
  showKeyInformationBar: boolean;
  keyInformationBarProperties: string[];
  addChildTables: boolean;
  childTablesList: string[];
}
