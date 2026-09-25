import { DocumentDefinition, DocumentInstanceFactoryArgs, IDocumentInstance } from "@/configuration-studio/models";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { SettingsPageDocument } from "./editor";
import { CsSettingsIcon } from "@/icons/configurationStudioIcons";


export const SettingsDocumentDefinition: DocumentDefinition = {
  documentType: "settings",
  icon: <CsSettingsIcon />,
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
