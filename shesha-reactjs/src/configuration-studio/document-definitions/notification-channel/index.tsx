import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsNotificationChannelIcon } from "@/icons/configurationStudioIcons";

export const NotificationChannelDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.NOTIFICATION_CHANNEL, {
  icon: <CsNotificationChannelIcon />,
  formId: { module: 'Shesha', name: 'cs-notification-channel-editor' },
});
