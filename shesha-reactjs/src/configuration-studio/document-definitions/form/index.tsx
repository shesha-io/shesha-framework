import { FormDesigner } from "@/components";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { DocumentDefinition, ITEM_TYPES, ItemEditorProps, ProviderRendererProps } from "@/configuration-studio/models";
import { DesignerMainArea } from "@/components/formDesigner/designerMainArea";
import { useMainStyles } from "@/components/formDesigner/styles/styles";
import { CanvasConfig } from "@/components/formDesigner/toolbar/canvasConfig";
import { Space } from "antd";
import React, { ReactNode } from "react";
import { FormToolbar } from "./toolbar";

export const FormDocumentDefinition: DocumentDefinition = {
  documentType: ITEM_TYPES.FORM,
  Editor: (_props: ItemEditorProps): ReactNode => {
    const { styles } = useMainStyles();
    return (
      <div className={styles.formDesigner}>
        <DesignerMainArea viewType="configStudio" />
      </div>
    );
  },
  Provider: (props: ProviderRendererProps): ReactNode => {
    const { children, doc: document } = props;
    return (
      <FormDesigner.NonVisual formId={document.itemId}>
        {children}
      </FormDesigner.NonVisual>
    );
  },
  Toolbar: (_props: ItemEditorProps): ReactNode => {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="horizontal" size={5}>
          <CanvasConfig />
          <FormToolbar />
        </Space>
      </div>
    );
  },
  documentInstanceFactory: (args) => {
    return new DocumentInstance({ ...args, itemType: FormDocumentDefinition.documentType, definition: FormDocumentDefinition });
  },
  createModalFooterButtons: 'none',
};
