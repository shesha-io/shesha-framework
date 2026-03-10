import { FormDesigner } from "@/components";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { DocumentDefinition, ITEM_TYPES, ItemEditorProps, ProviderRendererProps } from "@/configuration-studio/models";
import { DesignerMainArea } from "@/components/formDesigner/designerMainArea";
import { useMainStyles } from "@/components/formDesigner/styles/styles";
import { CanvasConfig } from "@/components/formDesigner/toolbar/canvasConfig";
import { Space } from "antd";
import React, { ReactNode, useEffect } from "react";
import { FormToolbar } from "./toolbar";
import { useFormDesigner } from "@/providers/formDesigner";
import { useConfigurationStudio } from "@/configuration-studio/cs/contexts";
import { FormOutlined } from "@ant-design/icons";

export const FormDocumentDefinition: DocumentDefinition = {
  documentType: ITEM_TYPES.FORM,
  icon: <FormOutlined />,
  Editor: (props: ItemEditorProps): ReactNode => {
    const { styles } = useMainStyles();
    const cs = useConfigurationStudio();
    const formDesigner = useFormDesigner();
    const { doc } = props;
    useEffect(() => {
      doc.setLoader(async () => {
        await formDesigner.loadAsync();
      });
      doc.setSaver(async (): Promise<void> => {
        await formDesigner.saveAsync();
      });
    }, [doc, formDesigner]);
    useEffect(() => {
      // Subscribe to changes
      const unsubscribe = formDesigner.subscribe('data-modified', () => {
        cs.setDocumentModified(doc.itemId, formDesigner.isDataModified);
      });
      return unsubscribe; // Cleanup on unmount
    }, [formDesigner, doc.itemId, cs]);

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
    return new DocumentInstance({
      ...args,
      itemType: FormDocumentDefinition.documentType,
      discriminator: FormDocumentDefinition.documentType,
      definition: FormDocumentDefinition,
    });
  },
  createModalFooterButtons: 'none',
};
