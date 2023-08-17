import React, { FC } from 'react';
import { IStylable, IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import {
  executeCustomExpression,
  getStyle
} from '../../../../providers/form/utils';
import {
  useForm,
  SubFormProvider,
  useGlobalState,
  useFormItem,
  useFormData,
} from '../../../../providers';
import SubForm from './subForm';
import ConfigurableFormItem from '../formItem';
import { SubFormSettingsForm } from './settings';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { ISubFormProviderProps } from 'providers/subForm/interfaces';

export interface ISubFormComponentProps
  extends Omit<ISubFormProviderProps, 'labelCol' | 'wrapperCol'>,
    IConfigurableFormComponent {
  labelCol?: number;
  wrapperCol?: number;
}

const SubFormComponent: IToolboxComponent<ISubFormComponentProps> = {
  type: 'subForm',
  name: 'Sub Form',
  icon: <FormOutlined />,
  factory: (model: ISubFormComponentProps) => {
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
  migrator: m => m
    .add<ISubFormComponentProps>(0, prev => ({ ...prev, apiMode: prev['apiMode'] ?? 'entityName' }))
    .add<ISubFormComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    ,
  settingsFormFactory: (props) => <SubFormSettingsForm {...props}/>,
  initModel: model => {
    const customProps: ISubFormComponentProps = {
      ...model,
      dataSource: 'form',
      apiMode: 'entityName',
      labelCol: 5,
      wrapperCol: 13,
    };
    return customProps;
  },
};

interface ISubFormWrapperProps
  extends Omit<ISubFormComponentProps, 'id' | 'type' | 'style' | 'labelCol' | 'wrapperCol'>,
    IStylable {
  id: string;
}

const SubFormWrapper: FC<ISubFormWrapperProps> = ({ style, readOnly, ...props }) => {
  const actionOwnerName = `Subform (${props.componentName})`;
  return (
    <SubFormProvider {...props} actionsOwnerId={props.id} actionOwnerName={actionOwnerName} key={props.id}>
      <SubForm style={style} readOnly={readOnly} />
    </SubFormProvider>
  );
};

export default SubFormComponent;
