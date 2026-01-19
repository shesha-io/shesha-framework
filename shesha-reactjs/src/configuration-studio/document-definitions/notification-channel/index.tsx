import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { NotificationOutlined } from "@ant-design/icons";
import React from "react";

export const NotificationChannelDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.NOTIFICATION_CHANNEL, {
  icon: <NotificationOutlined />,
  formId: { module: 'Shesha', name: 'cs-notification-channel-editor' },
});
