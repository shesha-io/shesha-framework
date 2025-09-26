import { FormDesigner } from "@/components";
import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { DocumentDefinition, ItemEditorProps, ProviderRendererProps } from "@/configuration-studio/models";
import { ITEM_TYPES } from "@/configuration-studio/models";
import React, { ReactNode } from "react";
import { FormToolbar } from "./toolbar";
import { DesignerMainArea } from "@/components/formDesigner/designerMainArea";
import { useMainStyles } from "@/components/formDesigner/styles/styles";

export const FormDocumentDefinition: DocumentDefinition = {
  documentType: ITEM_TYPES.FORM,
  Editor: (_props: ItemEditorProps): ReactNode => {
    const { styles } = useMainStyles();
    return (
      <div className={styles.formDesigner}>
        <DesignerMainArea />
      </div>
    );
  },
  Provider: ({ children, doc: document }: ProviderRendererProps): ReactNode => {
    return (
      <FormDesigner.NonVisual formId={document.itemId}>
        {children}
      </FormDesigner.NonVisual>
    );
  },
  Toolbar: (_props: ItemEditorProps): ReactNode => {
    return (
      <FormToolbar />
    );
  },
  documentInstanceFactory: (args) => {
    return new DocumentInstance({ ...args, itemType: FormDocumentDefinition.documentType, definition: FormDocumentDefinition });
  },
};
