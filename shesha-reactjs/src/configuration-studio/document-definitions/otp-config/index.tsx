import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { SafetyOutlined } from "@ant-design/icons";

export const OtpConfigDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.OTP_CONFIG, {
  icon: <SafetyOutlined />,
  formId: { module: 'Shesha', name: 'cs-otp-config-editor' },
});
