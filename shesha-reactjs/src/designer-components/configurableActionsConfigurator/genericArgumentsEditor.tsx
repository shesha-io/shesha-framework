import React, { useEffect } from 'react';
import { ConfigurableForm } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { IConfigurableActionArguments } from '@/interfaces/configurableAction';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';
import { ISettingsInputProps } from '../settingsInput/interfaces';

export interface IProps<TModel extends IConfigurableActionArguments> {
  model: TModel;
  markup: FormMarkup;
  onSave: (model: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
}

function GenericArgumentsEditor<TModel extends IConfigurableActionArguments>({
  onSave,
  model,
  markup,
  onValuesChange,
  readOnly = false,
}: IProps<TModel>) {
  const formRef = useShaFormRef();

  useEffect(() => {
    formRef.current?.resetFields();
  });

  const objectMarkup = JSON.parse(JSON.stringify(markup));

  const newMarkUp = Array.isArray(objectMarkup)
    ? objectMarkup.map((item: any) => ({
      ...item,
      type: "settingsInput",
      inputType: item.type === 'settingsInput' ? item.inputType : item.type,
      dropdownOptions: item?.values?.map((item: any) => ({
        ...item,
        label: item?.label,
        icon: item?.icon
      })),
      buttonGroupOptions: item.buttonGroupOptions

    }))
    : {
      ...objectMarkup,
      components: objectMarkup.components.map((item: any): ISettingsInputProps => ({
        ...item,
        type: "settingsInput",
        inputType: item.type,
        dropdownOptions: item?.values?.map((item: any) => ({
          ...item,
          label: item?.label,
          icon: item?.icon
        })),
        buttonGroupOptions: item?.items?.map((item: any) => ({
          ...item,
          icon: item?.icon
        }))
      }))
    };

  return (
    <ConfigurableForm
      layout='vertical'
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      shaFormRef={formRef}
      onFinish={onSave}
      markup={newMarkUp as FormMarkup}
      initialValues={model}
      onValuesChange={onValuesChange}
    />
  );
}

export default GenericArgumentsEditor;
