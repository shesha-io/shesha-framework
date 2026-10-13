import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsReferenceListIcon } from "@/icons/configurationStudioIcons";

export const ReferenceListDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.REFLIST, {
  icon: <CsReferenceListIcon />,
  formId: { module: 'Shesha', name: 'cs-reflist-editor' },
});
