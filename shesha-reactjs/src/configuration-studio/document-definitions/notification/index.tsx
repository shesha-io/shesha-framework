import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { MessageOutlined } from "@ant-design/icons";
import React from "react";

export const NotificationDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.NOTIFICATION, {
  icon: <MessageOutlined />,
  formId: { module: 'Shesha', name: 'cs-notification-type-editor' },
});
