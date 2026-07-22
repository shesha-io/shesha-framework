import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { SettingOutlined } from "@ant-design/icons";
import React from "react";

export const SettingDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.SETTING, {
  icon: <SettingOutlined />,
});
