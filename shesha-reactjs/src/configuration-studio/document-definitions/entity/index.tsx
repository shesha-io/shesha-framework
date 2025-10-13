import React, { ReactNode } from "react";
import { DocumentDefinition, ItemEditorProps, ProviderRendererProps, ITEM_TYPES } from "@/configuration-studio/models";

import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { EntityToolbar } from "./toolbar";
import { Form } from "antd";
import ModelConfiguratorRenderer from "@/components/modelConfigurator/renderer";
import { ModelConfiguratorProvider } from "@/providers";

export const EntityDocumentDefinition: DocumentDefinition = {
  documentType: ITEM_TYPES.ENTITY,
  Editor: (_props: ItemEditorProps): ReactNode => {
    return (
      <div>
        <ModelConfiguratorRenderer />
      </div>
    );
  },
  Provider: ({ children, doc: document }: ProviderRendererProps): ReactNode => {
    const [form] = Form.useForm();
    return (
      <ModelConfiguratorProvider id={document.itemId} form={form}>
        {children}
      </ModelConfiguratorProvider>
    );
  },
  Toolbar: (_props: ItemEditorProps): ReactNode => {
    return (
      <EntityToolbar />
    );
  },
  documentInstanceFactory: (args) => {
    return new DocumentInstance({ ...args, itemType: EntityDocumentDefinition.documentType, definition: EntityDocumentDefinition });
  },
};
