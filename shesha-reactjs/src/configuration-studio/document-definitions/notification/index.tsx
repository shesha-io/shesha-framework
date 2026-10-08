import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsNotificationIcon } from "@/icons/configurationStudioIcons";

export const NotificationDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.NOTIFICATION, {
  icon: <CsNotificationIcon />,
  formId: { module: 'Shesha', name: 'cs-notification-type-editor' },
});
