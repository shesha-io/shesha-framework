import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsRoleIcon } from "@/icons/configurationStudioIcons";

export const RoleDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.ROLE, {
  icon: <CsRoleIcon />,
  formId: { module: 'Shesha', name: 'cs-role-editor' },
});
