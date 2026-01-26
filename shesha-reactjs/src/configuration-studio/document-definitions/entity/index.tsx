import React, { ReactNode, useEffect } from "react";
import { DocumentDefinition, ItemEditorProps, ProviderRendererProps, ITEM_TYPES } from "@/configuration-studio/models";

import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { EntityToolbar } from "./toolbar";
import { Form, Space } from "antd";
import ModelConfiguratorRenderer from "@/components/modelConfigurator/renderer";
import { ModelConfiguratorProvider, useModelConfigurator } from "@/providers";
import { useConfigurationStudio } from "@/configuration-studio/cs/contexts";
import { TableOutlined } from "@ant-design/icons";

export const EntityDocumentDefinition: DocumentDefinition = {
  documentType: ITEM_TYPES.ENTITY,
  icon: <TableOutlined />,
  Editor: ({ doc }: ItemEditorProps): ReactNode => {
    const cs = useConfigurationStudio();
    const { load, saveForm, isModified } = useModelConfigurator();

    useEffect(() => {
      doc.setLoader(() => {
        load();
        return Promise.resolve();
      });
      doc.setSaver(async (): Promise<void> => {
        await saveForm();
      });
    }, [cs, doc, load, saveForm]);
    useEffect(() => {
      cs.setDocumentModified(doc.itemId, isModified);
    }, [cs, doc, isModified]);
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
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="horizontal" size={5}>
          <EntityToolbar />
        </Space>
      </div>
    );
  },
  documentInstanceFactory: (args) => {
    return new DocumentInstance({
      ...args,
      itemType: EntityDocumentDefinition.documentType,
      discriminator: EntityDocumentDefinition.documentType,
      definition: EntityDocumentDefinition,
    });
  },
  contextMenuBuilder: (menu) => menu.filter((item) => !['rename', 'duplicate', 'viewJsonConfig'].includes(item?.key as string)),
};
