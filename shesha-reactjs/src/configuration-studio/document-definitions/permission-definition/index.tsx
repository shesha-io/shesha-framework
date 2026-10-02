import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsSchemaIcon } from "@/icons/configurationStudioIcons";

export const PermissionDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.PERMISSION, {
  icon: <CsSchemaIcon />,
});
