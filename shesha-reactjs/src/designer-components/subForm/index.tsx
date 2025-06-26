import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { FormOutlined } from '@ant-design/icons';
import { getStyle } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ISubFormProviderProps } from '@/providers/subForm/interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import {
  useForm,
  useFormItem,
  useFormData,
} from '@/providers';
import { SubFormWrapper } from './subFormWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';

export interface ISubFormComponentProps
  extends Omit<ISubFormProviderProps, 'labelCol' | 'wrapperCol'>,
  Omit<IConfigurableFormComponent, 'queryParams'> {
  labelCol?: number;
  wrapperCol?: number;
  queryParams?: ISubFormProviderProps['queryParams'];
}

const SubFormComponent: IToolboxComponent<ISubFormComponentProps> = {
  type: 'subForm',
  name: 'Sub Form',
  icon: <FormOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { namePrefix } = useFormItem();

    if (model.hidden && formMode !== 'designer') return null;
    
    const name = namePrefix ? [namePrefix, model?.propertyName]?.join('.') : model?.propertyName;

    const rerenderKey = `${model?.label || ''}-${model?.hideLabel || false}-${model?.labelCol || 0}`;

    return (
      <ConfigurableFormItem
        key={rerenderKey}
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
    .add<ISubFormComponentProps>(3, (prev) => ({
      ...migrateFormApi.properties(prev),
      onCreated: migrateFormApi.withoutFormData(prev?.onCreated),
      onUpdated: migrateFormApi.withoutFormData(prev?.onUpdated),
    }))
    .add<ISubFormComponentProps>(4, prev => ({ ...prev, hideLabel: true })),
  settingsFormMarkup: (props) => getSettings(props),
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
  getFieldsToFetch: (propertyName) => {
    return [
      propertyName + '.id',
      propertyName + '._displayName',
      propertyName + '._className',
    ];
  },
};

export default SubFormComponent;