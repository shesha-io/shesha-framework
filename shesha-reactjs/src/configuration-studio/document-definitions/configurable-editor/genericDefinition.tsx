import { DocumentInstance } from "@/configuration-studio/cs/documentInstance";
import { DocumentDefinition, IDocumentInstance, ItemEditorProps, ProviderRendererProps } from "@/configuration-studio/models";
import { configurableItemIdentifierToString, FormFullName } from "@/interfaces";
import { ShaFormProvider } from "@/providers/form/providers/shaFormProvider";
import { useShaForm } from "@/providers/form/store/shaFormInstance";
import ParentProvider from "@/providers/parentProvider";
import { Form, Result } from "antd";
import { ReactNode, useEffect } from "react";
import { ConfigurableEditor } from ".";
import { GenericToolbar } from "./toolbar";
import { useConfigurationStudio } from "@/configuration-studio/cs/contexts";
import { FileUnknownOutlined } from "@ant-design/icons";

export interface DummyEditorProps {
  icon?: ReactNode;
  formId?: FormFullName;
}

const EmptyProvider = <TDoc extends IDocumentInstance = IDocumentInstance>({ children }: ProviderRendererProps<TDoc>): ReactNode => (<>{children}</>);

const EditorNotAvailable = (): ReactNode => {
  return (
    <Result
      status="404"
      title="Editor is not available"
      subTitle="Sorry, editor of the document you opened does not exist."
    />
  );
};
const EmptyComponent = (): ReactNode => null;


/**
 * Fallback definition for an item type with no editor. `icon` is optional so a type that
 * registers an icon but no edit form (e.g. Setting, Permission) still shows its own icon
 * instead of the generic "unknown file" one.
 */
export const getUnknownDocumentDefinition = (itemType: string, icon?: ReactNode): DocumentDefinition => {
  const definition: DocumentDefinition = {
    documentType: itemType,
    icon: icon ?? <FileUnknownOutlined />,
    Provider: EmptyProvider,
    Editor: EditorNotAvailable,
    Toolbar: EmptyComponent,
    documentInstanceFactory: (args) => {
      return new DocumentInstance({ ...args, itemType, discriminator: itemType, definition });
    },
  };
  return definition;
};

export const getGenericDefinition = (itemType: string, editorProps?: DummyEditorProps): DocumentDefinition => {
  const formId = editorProps?.formId;
  // No edit form: fall back to the read-only definition, but keep the caller's icon.
  if (!formId)
    return getUnknownDocumentDefinition(itemType, editorProps?.icon);

  const definition: DocumentDefinition = {
    documentType: itemType,
    icon: editorProps.icon,

    Provider: (props: ProviderRendererProps): ReactNode => {
      const { children, doc } = props;
      const cs = useConfigurationStudio();
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
          doc.setSaver(async (): Promise<void> => {
            await instance.submitData();
          });
        },
      });
      useEffect(() => {
        // Subscribe to changes
        const unsubscribe = shaForm.subscribe('data-modified', () => {
          cs.setDocumentModified(doc.itemId, shaForm.isDataModified);
        });
        return unsubscribe; // Cleanup on unmount
      }, [shaForm, doc.itemId, cs]);

      return (
        <ShaFormProvider shaForm={shaForm}>
          <ParentProvider
            model={undefined}
            formMode={shaForm.formMode}
            formFlatMarkup={shaForm.flatStructure}
            formApi={shaForm.getPublicFormApi()}
            name={configurableItemIdentifierToString(formId)}
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
          doc={document}
        />
      );
    },
    Toolbar: (props: ItemEditorProps): ReactNode => {
      return (
        <GenericToolbar {...props} />
      );
    },
    documentInstanceFactory: (args) => {
      return new DocumentInstance({ ...args, definition, itemType, discriminator: args.discriminator });
    },
  };
  return definition;
};
