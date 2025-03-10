import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Checkbox, CheckboxProps } from 'antd';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getStyle, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useFormData } from '@/providers';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { ICheckboxComponentProps } from './interfaces';
import {
  migratePropertyName,
  migrateCustomFunctions,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getEventHandlers } from '@/components/formDesigner/components/utils';

const CheckboxComponent: IToolboxComponent<ICheckboxComponentProps> = {
  type: 'checkbox',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Checkbox',
  icon: <CheckSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();
    const { data } = useFormData();

    interface ExtendedCheckboxProps extends CheckboxProps {
      onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    }

    return (
      <ConfigurableFormItem model={model} valuePropName="checked" initialValue={model?.defaultValue}>
        {(value, onChange) => {
          const customEvents = getEventHandlers(model, allData);
          const onChangeInternal = (...args: any[]) => {
            customEvents.onChange({ ...args[0], currentTarget: { value: args[0].target.checked } });
            if (typeof onChange === 'function') onChange(...args);
          };
          return model.readOnly ? (
            <ReadOnlyDisplayFormItem checked={value} type="checkbox" disabled={model.readOnly} />
          ) : (
            <Checkbox
              className="sha-checkbox"
              disabled={model.readOnly}
              style={getStyle(model?.style, data)}
              checked={value}
              onChange={onChangeInternal}
              onBlur={customEvents.onBlur}
              onFocus={customEvents.onFocus}
              {...({} as ExtendedCheckboxProps)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) =>
    m
      .add<ICheckboxComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ICheckboxComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<ICheckboxComponentProps>(2, (prev) => migrateReadOnly(prev))
      .add<ICheckboxComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<ICheckboxComponentProps>(4, (prev) => {
        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      }),
};

export default CheckboxComponent;
