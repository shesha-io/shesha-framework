import { DocumentDefinition, DocumentInstanceFactoryArgs, IDocumentInstance } from "@/configuration-studio/models";
import React from "react";
import { HomePageDocument } from "./editor";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { HomeOutlined } from "@ant-design/icons";


export const HomeDocumentDefinition: DocumentDefinition = {
  documentType: "home",
  icon: <HomeOutlined />,
  Editor: () => <HomePageDocument />,
  documentInstanceFactory: function (args: DocumentInstanceFactoryArgs): IDocumentInstance {
    const doc = new DocumentInstance({
      ...args,
      itemType: HomeDocumentDefinition.documentType,
      discriminator: HomeDocumentDefinition.documentType,
      definition: HomeDocumentDefinition,
    });
    doc.type = 'custom';
    return doc;
  },
};
