import { DocumentDefinition, DocumentInstanceFactoryArgs, IDocumentInstance } from "@/configuration-studio/models";
import { HomePageDocument } from "./editor";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { CsHomeIcon } from "@/icons/configurationStudioIcons";


export const HomeDocumentDefinition: DocumentDefinition = {
  documentType: "home",
  icon: <CsHomeIcon />,
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
