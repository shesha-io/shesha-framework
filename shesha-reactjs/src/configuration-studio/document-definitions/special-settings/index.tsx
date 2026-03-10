import { DocumentDefinition, DocumentInstanceFactoryArgs, IDocumentInstance } from "@/configuration-studio/models";
import React from "react";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { SettingsPageDocument } from "./editor";
import { SettingOutlined } from "@ant-design/icons";


export const SettingsDocumentDefinition: DocumentDefinition = {
  documentType: "settings",
  icon: <SettingOutlined />,
  Editor: () => <SettingsPageDocument />,
  documentInstanceFactory: function (args: DocumentInstanceFactoryArgs): IDocumentInstance {
    const doc = new DocumentInstance({
      ...args,
      itemType: SettingsDocumentDefinition.documentType,
      discriminator: SettingsDocumentDefinition.documentType,
      definition: SettingsDocumentDefinition,
    });
    doc.type = 'custom';
    return doc;
  },
};
