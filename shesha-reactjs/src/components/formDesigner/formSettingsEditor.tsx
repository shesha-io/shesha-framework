import React, { FC } from 'react';
import { Modal } from 'antd';
import { ConfigurableForm } from '@/components';
import formSettingsJson from './formSettings.json';
import { FormMarkup } from '@/providers/form/models';
import { useFormDesignerActions, useFormDesignerState } from '@/providers/formDesigner';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { useTheme } from '@/index';
import { useShaFormRef } from '@/providers/form/newProvider/shaFormProvider';

const formSettingsMarkup = formSettingsJson as FormMarkup;

export interface IFormSettingsEditorProps {
  isVisible: boolean;
  close: () => void;
  readOnly: boolean;
}

export const FormSettingsEditor: FC<IFormSettingsEditorProps> = ({ isVisible, close, readOnly }) => {
  const { theme } = useTheme();
  const { formSettings } = useFormDesignerState();
  const { updateFormSettings } = useFormDesignerActions();
  const { formProps } = useFormPersister();
  const formRef = useShaFormRef();

  formSettings.labelCol = { span: formSettings?.labelCol?.span || theme.labelSpan };
  formSettings.wrapperCol = { span: formSettings?.wrapperCol?.span || theme.componentSpan };

  const onSave = values => {
    if (!readOnly) {
      updateFormSettings(values);
      close();
    }
  };

  const sourcesFolder = `/forms/${formProps.module}/${formProps.name}`;

  return (
    <Modal
      open={isVisible}
      title="Form Settings"
      width="50vw"

      onOk={() => {
        formRef.current?.submit();
      }}
      okButtonProps={{ hidden: readOnly }}

      onCancel={close}
      cancelText={readOnly ? 'Close' : undefined}
    >
      <SourceFilesFolderProvider folder={sourcesFolder}>
        <ConfigurableForm
          layout="horizontal"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          mode={readOnly ? 'readonly' : 'edit'}
          
          shaFormRef={formRef}
          onFinish={onSave}
          markup={formSettingsMarkup}
          initialValues={formSettings}
        />
      </SourceFilesFolderProvider>
    </Modal>
  );
};