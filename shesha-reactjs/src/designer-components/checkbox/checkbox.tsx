import React from 'react';
import { IToolboxComponent } from '../../interfaces';
import { FormMarkup } from '../../providers/form/models';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '../../providers/form/utils';
import { DataTypes } from '../../interfaces/dataTypes';
import { useForm, useFormData } from '../../providers';
import ReadOnlyDisplayFormItem from '../../components/readOnlyDisplayFormItem';
import { ICheckboxComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const CheckboxComponent: IToolboxComponent<ICheckboxComponentProps> = {
  type: 'checkbox',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox',
  icon: <CheckSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  factory: (model: ICheckboxComponentProps) => {
    const { formMode, isComponentDisabled } = useForm();
    const { data } = useFormData();
    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

    return (
      <ConfigurableFormItem model={model} valuePropName="checked" initialValue={model?.defaultValue}>
        {(value, onChange) => (
          isReadOnly ? (
            <ReadOnlyDisplayFormItem value={value} type="checkbox" disabled={disabled} />
          ) : (
            <Checkbox className="sha-checkbox" disabled={disabled} style={getStyle(model?.style, data)} 
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
  ,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default CheckboxComponent;
