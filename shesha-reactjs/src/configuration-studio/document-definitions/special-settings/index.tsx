import { DocumentDefinition, DocumentInstanceFactoryArgs, IDocumentInstance } from "@/configuration-studio/models";
import React from "react";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { SettingsPageDocument } from "./editor";


export const SettingsDocumentDefinition: DocumentDefinition = {
  documentType: "settings",
  Editor: () => <SettingsPageDocument />,
  documentInstanceFactory: function (args: DocumentInstanceFactoryArgs): IDocumentInstance {
    const doc = new DocumentInstance({ ...args, itemType: SettingsDocumentDefinition.documentType, definition: SettingsDocumentDefinition });
    doc.type = 'custom';
    return doc;
  },
};
