import React, { FC } from 'react';
import { IStylable, IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import { executeCustomExpression, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, SubFormProvider, SubFormProviderProps, useGlobalState, useFormItem } from '../../../../providers';
import { alertSettingsForm } from './settings';
import SubForm from './subForm';
import ConfigurableFormItem from '../formItem';
import { SubFormSettings } from './settingsv2';

export interface ISubFormProps
  extends Omit<SubFormProviderProps, 'labelCol' | 'wrapperCol'>,
  IConfigurableFormComponent {
  name: string;
  labelCol?: number;
  wrapperCol?: number;
}

const SubFormComponent: IToolboxComponent<ISubFormProps> = {
  type: 'subForm',
  name: 'Sub Form',
  icon: <FormOutlined />,
  factory: (model: ISubFormProps) => {
    const { formMode, formData } = useForm();
    const { globalState } = useGlobalState();

    const isVisibleByCondition = executeCustomExpression(model?.customVisibility, true, formData, globalState);

    if (!isVisibleByCondition && formMode !== 'designer') return null;

    const { namePrefix } = useFormItem();

    const name = namePrefix ? [namePrefix, model?.name]?.join('.') : model?.name;

    return (
      <ConfigurableFormItem
        model={model}
        labelCol={{ span: model?.hideLabel ? 0 : model?.labelCol }}
        wrapperCol={{ span: model?.hideLabel ? 24 : model?.wrapperCol }}
      >
        <SubFormWrapper {...model} name={name} style={getStyle(model?.style, formData)} />
      </ConfigurableFormItem>
    );
  },
  // settingsFormMarkup: alertSettingsForm,
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <SubFormSettings
        readOnly={readOnly}
        model={model as any}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  initModel: model => {
    const customProps: ISubFormProps = {
      ...model,
      dataSource: 'form',
      labelCol: 5,
      wrapperCol: 13,
    };
    return customProps;
  },
  validateSettings: model => validateConfigurableComponentSettings(alertSettingsForm, model),
};

interface ISubFormWrapperProps extends Omit<ISubFormProps, 'id' | 'type' | 'style' | 'labelCol' | 'wrapperCol'>, IStylable {
  id: string;
}

const SubFormWrapper: FC<ISubFormWrapperProps> = ({ style, readOnly, ...props }) => {
  const actionOwnerName = `Subform (${props.name})`;
  return (
    <SubFormProvider {...props} actionsOwnerId={props.id} actionOwnerName={actionOwnerName}>
      <SubForm style={style} readOnly={readOnly} />
    </SubFormProvider>
  );
};

export default SubFormComponent;
