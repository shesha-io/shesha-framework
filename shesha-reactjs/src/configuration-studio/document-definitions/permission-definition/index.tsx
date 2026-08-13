import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { SafetyOutlined } from "@ant-design/icons";

export const PermissionDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.PERMISSION, {
  icon: <SafetyOutlined />,
});
