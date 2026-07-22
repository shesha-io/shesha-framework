import { IEntityTypeIdentifier } from "../../entities/models";

export interface DetailsViewExtensionJson {
  modelType: string | IEntityTypeIdentifier;
  showKeyInformationBar: boolean;
  keyInformationBarProperties: string[] | undefined;
  addChildTables: boolean;
  childTablesList: string[];
}
