import { DocumentDefinition } from "@/configuration-studio/models";
import { ITEM_TYPES } from "@/configuration-studio/models";
import { getGenericDefinition } from "../configurable-editor/genericDefinition";

export const SettingDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.SETTING);
