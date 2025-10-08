import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";

export const NotificationChannelDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.NOTIFICATION_CHANNEL);
