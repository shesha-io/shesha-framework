import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { DocumentDefinition, ItemEditorProps, ProviderRendererProps } from "@/configuration-studio/models";
import { ConfigurableItemIdentifierToString, FormFullName } from "@/interfaces";
import { ShaFormProvider } from "@/providers/form/providers/shaFormProvider";
import { useShaForm } from "@/providers/form/store/shaFormInstance";
import ParentProvider from "@/providers/parentProvider";
import { Form, Result } from "antd";
import React, { FC, PropsWithChildren, ReactNode } from "react";
import { ConfigurableEditor } from ".";
import { GenericToolbar } from "./toolbar";

export interface DummyEditorProps {
  formId: FormFullName;
}

const EmptyProvider: FC<PropsWithChildren> = ({ children }) => (<>{children}</>);
const EditorNotAvailable: FC = () => {
  return (
    <Result
      status="404"
      title="Editor is not available"
      subTitle="Sorry, editor of the document you opened does not exist."
    />
  );
};
const EmptyComponent: FC = () => null;

export const getUnknownDocumentDefinition = (itemType: string): DocumentDefinition => {
  const definition: DocumentDefinition = {
    documentType: itemType,
    Provider: EmptyProvider,
    Editor: EditorNotAvailable,
    Toolbar: EmptyComponent,
    documentInstanceFactory: (args) => {
      return new DocumentInstance({ ...args, itemType, definition });
    },
  };
  return definition;
};

export const getGenericDefinition = (itemType: string, editorProps?: DummyEditorProps): DocumentDefinition => {
  const formId = editorProps?.formId;
  if (!formId)
    return getUnknownDocumentDefinition(itemType);

  const definition: DocumentDefinition = {
    documentType: itemType,

    Provider: (props: ProviderRendererProps): ReactNode => {
      const { children, doc } = props;
      const [form] = Form.useForm();
      const [shaForm] = useShaForm({
        form: undefined,
        antdForm: form,
        init: (instance) => {
          instance.setLogEnabled(false);

          doc.setLoader(async (): Promise<void> => {
            await instance.reloadMarkup();
            await instance.fetchData();
          });
        },
      });

      return (
        <ShaFormProvider shaForm={shaForm}>
          <ParentProvider
            model={null}
            formMode={shaForm.formMode}
            formFlatMarkup={shaForm.flatStructure}
            formApi={shaForm.getPublicFormApi()}
            name={ConfigurableItemIdentifierToString(formId)}
            isScope
          >
            {children}
          </ParentProvider>
        </ShaFormProvider>
      );
    },
    Editor: (props: ItemEditorProps): ReactNode => {
      const { doc: document } = props;
      return (
        <ConfigurableEditor
          formId={formId}
          itemId={document.itemId}
        />
      );
    },
    Toolbar: (props: ItemEditorProps): ReactNode => {
      return (
        <GenericToolbar {...props} />
      );
    },
    documentInstanceFactory: (args) => {
      return new DocumentInstance({ ...args, definition, itemType });
    },
  };
  return definition;
};
