import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { TeamOutlined } from "@ant-design/icons";
import React from "react";

export const RoleDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.ROLE, {
  icon: <TeamOutlined />,
  formId: { module: 'Shesha', name: 'cs-role-editor' },
});
