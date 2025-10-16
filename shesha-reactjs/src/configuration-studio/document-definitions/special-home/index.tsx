import { DocumentDefinition, DocumentInstanceFactoryArgs, IDocumentInstance } from "@/configuration-studio/models";
import React from "react";
import { HomePageDocument } from "./editor";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";


export const HomeDocumentDefinition: DocumentDefinition = {
  documentType: "home",
  Editor: () => <HomePageDocument />,
  documentInstanceFactory: function (args: DocumentInstanceFactoryArgs): IDocumentInstance {
    const doc = new DocumentInstance({ ...args, itemType: HomeDocumentDefinition.documentType, definition: HomeDocumentDefinition });
    doc.type = 'custom';
    return doc;
  },
};
