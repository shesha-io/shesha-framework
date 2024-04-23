import React, { FC } from 'react';
import { Form, Modal, Tabs } from 'antd';
import { ConfigurableForm } from '@/components';
import formSettingsJson from './formSettings.json';
import { FormMarkup } from '@/providers/form/models';
import { CodeVariablesTables } from '@/components/codeVariablesTable';
import { useFormDesigner } from '@/providers/formDesigner';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { useFormPersister } from '@/providers/formPersisterProvider';

export interface IFormSettingsEditorProps {
  isVisible: boolean;
  close: () => void;
  readOnly: boolean;
}

export const FormSettingsEditor: FC<IFormSettingsEditorProps> = ({ isVisible, close, readOnly }) => {
  const [form] = Form.useForm();
  const { formSettings, updateFormSettings } = useFormDesigner();
  const { formProps } = useFormPersister();

  const onSave = values => {
    if (!readOnly)
      updateFormSettings(values);
    close();
  };
  
  const sourcesFolder = `/forms/${formProps.module}/${formProps.name}`;

  return (
    <Modal
      open={isVisible}
      title="Form Settings"
      width="50vw"

      onOk={() => {
        form.submit();
      }}
      okButtonProps={{ hidden: readOnly }}

      onCancel={close}
      cancelText={readOnly ? 'Close' : undefined}
    >
      <Tabs
        items={[
          {
            key: "form",
            label: "Form",
            children: (
              <SourceFilesFolderProvider folder={sourcesFolder}>
                <ConfigurableForm
                  layout="horizontal"
                  labelCol={{ span: 7 }}
                  wrapperCol={{ span: 17 }}
                  mode={readOnly ? 'readonly' : 'edit'}
                  form={form}
                  onFinish={onSave}
                  markup={formSettingsJson as FormMarkup}
                  initialValues={formSettings}
                />
              </SourceFilesFolderProvider>
            )
          },
          {
            key: "variable",
            label: "URL Variables",
            children: (
              <CodeVariablesTables
                data={[
                  {
                    id: '6ea37032-2abd-4e80-a32c-ce143ad3294d',
                    name: 'data',
                    description: 'Form data',
                    type: 'object',
                  },
                  {
                    id: '00ce7c76-0a9d-4d7d-b864-6e3ac5e6916a',
                    name: 'parentFormValues',
                    description: 'The parent form. This is data for the form that will be rendering the current form',
                    type: 'object',
                  },
                  {
                    id: '3b96ab61-f978-482c-a34c-a61ddaa5357d',
                    name: 'globalState',
                    description: 'The global state',
                    type: 'object',
                  },
                  {
                    id: '48f2b593-1761-4f0c-8312-064a6bb1207e',
                    name: 'query',
                    description: 'query parameters object',
                    type: 'object',
                  },
                ]}
              />

            )
          }
        ]}
      >
      </Tabs>
    </Modal>
  );
};