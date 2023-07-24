import React, { FC } from 'react';
import { IStylable, IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import {
  executeCustomExpression,
  getStyle,
  validateConfigurableComponentSettings,
} from '../../../../providers/form/utils';
import {
  useForm,
  SubFormProvider,
  SubFormProviderProps,
  useGlobalState,
  useFormItem,
  useFormData,
} from '../../../../providers';
import { alertSettingsForm } from './settings';
import SubForm from './subForm';
import ConfigurableFormItem from '../formItem';
import { SubFormSettings } from './settingsv2';

export interface ISubFormProps
  extends Omit<SubFormProviderProps, 'labelCol' | 'wrapperCol'>,
    IConfigurableFormComponent {
  propertyName: string;
  labelCol?: number;
  wrapperCol?: number;
}

const SubFormComponent: IToolboxComponent<ISubFormProps> = {
  type: 'subForm',
  name: 'Sub Form',
  icon: <FormOutlined />,
  factory: (model: ISubFormProps) => {
    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const isVisibleByCondition = executeCustomExpression(model?.customVisibility, true, formData, globalState);

    const { namePrefix } = useFormItem();

    if (!isVisibleByCondition && formMode !== 'designer') return null;

    const name = namePrefix ? [namePrefix, model?.propertyName]?.join('.') : model?.propertyName;

    return (
      <ConfigurableFormItem
        model={model}
        labelCol={{ span: model?.hideLabel ? 0 : model?.labelCol }}
        wrapperCol={{ span: model?.hideLabel ? 24 : model?.wrapperCol }}
      >
        <SubFormWrapper {...model} propertyName={name} style={getStyle(model?.style, formData)} />
      </ConfigurableFormItem>
    );
  },
  // settingsFormMarkup: alertSettingsForm,
  migrator: m => m.add<ISubFormProps>(0, prev => ({ ...prev, apiMode: 'entityName' })),
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
      apiMode: 'entityName',
      labelCol: 5,
      wrapperCol: 13,
    };
    return customProps;
  },
  validateSettings: model => validateConfigurableComponentSettings(alertSettingsForm, model),
};

interface ISubFormWrapperProps
  extends Omit<ISubFormProps, 'id' | 'type' | 'style' | 'labelCol' | 'wrapperCol'>,
    IStylable {
  id: string;
}

const SubFormWrapper: FC<ISubFormWrapperProps> = ({ style, readOnly, ...props }) => {
  const actionOwnerName = `Subform (${props.propertyName})`;
  return (
    <SubFormProvider {...props} actionsOwnerId={props.id} actionOwnerName={actionOwnerName} key={props.id}>
      <SubForm style={style} readOnly={readOnly} />
    </SubFormProvider>
  );
};

export default SubFormComponent;
