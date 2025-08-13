import React, { ReactNode } from "react";
import { DocumentDefinition, ItemEditorProps, ProviderRendererProps } from "@/configuration-studio/models";
import { ITEM_TYPES } from "@/configuration-studio/models";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { EntityToolbar } from "./toolbar";
import { ModelConfiguratorProvider } from "@/index";
import { Form } from "antd";
import ModelConfiguratorRenderer from "@/components/modelConfigurator/renderer";

//export const EntityDocumentDefinition: DocumentDefinition = getGenericDefinition(ITEM_TYPES.ENTITY);

export const EntityDocumentDefinition: DocumentDefinition = {
  documentType: ITEM_TYPES.ENTITY,
  Editor: (_props: ItemEditorProps): ReactNode => {
      //const { styles } = useMainStyles();
      return (
          <div /*className={styles.formDesigner}*/>
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
      return new DocumentInstance(EntityDocumentDefinition, EntityDocumentDefinition.documentType, args.itemId, args.label, args.flags);
  }
};