import React, { FC } from 'react';
import { IStylable, IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import {
  getStyle
} from '@/providers/form/utils';
import {
  useForm,
  SubFormProvider,
  useFormItem,
  useFormData,
} from '@/providers';
import SubForm from './subForm';
import ConfigurableFormItem from '../formItem';
import { SubFormSettingsForm } from './settings';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { ISubFormProviderProps } from '@/providers/subForm/interfaces';

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
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { data: formData } = useFormData();

    const { namePrefix } = useFormItem();

    if (model.hidden && formMode !== 'designer') return null;

    const name = namePrefix ? [namePrefix, model?.propertyName]?.join('.') : model?.propertyName;

    return (
      <ConfigurableFormItem
        model={model}
        labelCol={{ span: model?.hideLabel ? 0 : model?.labelCol }}
        wrapperCol={{ span: model?.hideLabel ? 24 : model?.wrapperCol }}
      >
        {(value, onChange) => {
          return <SubFormWrapper {...model} value={value} propertyName={name} style={getStyle(model?.style, formData)} onChange={onChange} />;
        }}
      </ConfigurableFormItem>
    );
  },
  // settingsFormMarkup: alertSettingsForm,
  migrator: m => m
    .add<ISubFormComponentProps>(0, prev => ({ ...prev, apiMode: prev['apiMode'] ?? 'entityName' }))
    .add<ISubFormComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ISubFormComponentProps>(2, (prev) => migrateReadOnly(prev))
  ,
  settingsFormFactory: (props) => <SubFormSettingsForm {...props}/>,
  initModel: model => {
    const customProps: ISubFormComponentProps = {
      ...model,
      dataSource: 'form',
      apiMode: 'entityName',
      labelCol: 8,
      wrapperCol: 16,
    };
    return customProps;
  },
};

interface ISubFormWrapperProps
  extends Omit<ISubFormComponentProps, 'id' | 'type' | 'style' | 'labelCol' | 'wrapperCol'>,
    IStylable {
  id: string;
}

const SubFormWrapper: FC<ISubFormWrapperProps> = ({ style, ...props }) => {
  return (
    <SubFormProvider {...props} key={props.id}>
      <SubForm style={style} readOnly={props.readOnly} />
    </SubFormProvider>
  );
};

export default SubFormComponent;
