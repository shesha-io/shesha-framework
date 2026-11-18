import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { CsOtpConfigIcon } from "@/icons/configurationStudioIcons";

export const OtpConfigDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.OTP_CONFIG, {
  icon: <CsOtpConfigIcon />,
  formId: { module: 'Shesha', name: 'cs-otp-config-editor' },
});
