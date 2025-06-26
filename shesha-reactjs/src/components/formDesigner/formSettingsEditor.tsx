import React, { FC } from 'react';
import { Modal } from 'antd';
import { ConfigurableForm } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { useTheme } from '@/index';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';
import { getSettings } from './formSettings';

const formSettingsMarkup = getSettings() as FormMarkup;

export interface IFormSettingsEditorProps {
  isVisible: boolean;
  close: () => void;
  readOnly: boolean;
}

export const FormSettingsEditor: FC<IFormSettingsEditorProps> = ({ isVisible, close, readOnly }) => {
  const { theme } = useTheme();
  const formSettings = useFormDesignerStateSelector(x => x.formSettings);
  const { updateFormSettings } = useFormDesignerActions();
  const { formProps } = useFormPersister();
  const formRef = useShaFormRef();

  formSettings.labelCol = { span: formSettings?.labelCol?.span || theme?.labelSpan };
  formSettings.wrapperCol = { span: formSettings?.wrapperCol?.span || theme?.componentSpan };

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
      width="clamp(590px, 50vw, 800px)" // min 320px, preferred 50vw, max 700px
      onOk={() => {
        formRef.current?.submit();
      }}
      okButtonProps={{ hidden: readOnly }}

      onCancel={close}
      cancelText={readOnly ? 'Close' : undefined}
    >
      <SourceFilesFolderProvider folder={sourcesFolder}>
        <ConfigurableForm
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          className='sha-form-settings-editor'
          shaFormRef={formRef}
          onFinish={onSave}
          markup={formSettingsMarkup}
          initialValues={formSettings}
        />
      </SourceFilesFolderProvider>
    </Modal>
  );
};