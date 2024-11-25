import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { useFormData } from '@/providers';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { ICheckboxComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IInputStyles } from '../textField/interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const CheckboxComponent: IToolboxComponent<ICheckboxComponentProps> = {
  type: 'checkbox',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox',
  icon: <CheckSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model }) => {
    const { data } = useFormData();
    return (
      <ConfigurableFormItem model={model} valuePropName="checked" initialValue={model?.defaultValue}>
        {(value, onChange) => (
          model.readOnly ? (
            <ReadOnlyDisplayFormItem checked={value} type="checkbox" disabled={model.readOnly} />
          ) : (
            <Checkbox className="sha-checkbox" disabled={model.readOnly} style={getStyle(model?.style, data)} 
              checked={value} 
              onChange={onChange}
            />
          )
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<ICheckboxComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ICheckboxComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ICheckboxComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ICheckboxComponentProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
    .add<ICheckboxComponentProps>(4, (prev) => {
      const styles: IInputStyles = {
        style: prev.style
      };

      return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
    })
  ,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default CheckboxComponent;
