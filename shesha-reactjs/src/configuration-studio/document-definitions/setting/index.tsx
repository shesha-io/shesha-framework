import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsSettingsIcon } from "@/icons/configurationStudioIcons";

export const SettingDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.SETTING, {
  icon: <CsSettingsIcon />,
});
