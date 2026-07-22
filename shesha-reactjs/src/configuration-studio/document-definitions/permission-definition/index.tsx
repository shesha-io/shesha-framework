import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { SafetyOutlined } from "@ant-design/icons";
import React from "react";

export const PermissionDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.PERMISSION, {
  icon: <SafetyOutlined />,
});
