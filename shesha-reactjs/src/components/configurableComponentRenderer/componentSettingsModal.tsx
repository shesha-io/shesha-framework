import React from 'react';
import { Modal } from 'antd';
import { ConfigurableForm } from '@/components/configurableForm';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';

export interface IProps<TModel = any> {
  title?: string;
  model: TModel;
  markup: IConfigurableFormComponent[];
  onCancel: () => void;
  onSave: (model: TModel) => void;
}

export const ComponentSettingsModal = <TSettings extends object>({ title, markup, model, onCancel, onSave }: IProps<TSettings>): JSX.Element => {
  const formLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const formRef = useShaFormRef();

  const onOk = (): void => {
    formRef.current?.submit();
  };

  return (
    <Modal open={true} title={title} onCancel={onCancel} onOk={onOk}>
      <ConfigurableForm
        mode="edit"
        {...formLayout}
        shaFormRef={formRef}
        onFinish={onSave}
        markup={markup}
        initialValues={model}
      />
    </Modal>
  );
};
