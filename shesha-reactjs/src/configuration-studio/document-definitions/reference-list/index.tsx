import { DocumentDefinition, ITEM_TYPES } from "@/configuration-studio/models";

import { getGenericDefinition } from "../configurable-editor/genericDefinition";
import { OrderedListOutlined } from "@ant-design/icons";
import React from "react";

export const ReferenceListDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.REFLIST, {
  icon: <OrderedListOutlined />,
  formId: { module: 'Shesha', name: 'cs-reflist-editor' },
});
