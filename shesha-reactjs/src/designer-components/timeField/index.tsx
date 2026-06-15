import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { TimePickerWrapper } from './timePickerWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { ITimePickerComponentProps, TimeFieldComponentDefinition, TimeFieldValueType } from './models';

const DATE_TIME_FORMAT = 'HH:mm';

export const TimeFieldComponent: TimeFieldComponentDefinition = {
  type: 'timePicker',
  name: 'Time Picker',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <ClockCircleOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.time,
  Factory: ({ model }) => {
    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles?.fontStyles,
      ...model.allStyles?.dimensionsStyles,
    } : model.allStyles?.fullStyle;

    return (
      <ConfigurableFormItem<TimeFieldValueType> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <TimePickerWrapper
              {...model}
              style={finalStyle}
              value={value}
              onChange={(value: number | [number, number] | null) => {
                // TODO: EVENTS: pass timeString to event handler
                // addContextData(context, { timeString, value })
                ctx?.handleEvent(undefined, value, model.onChangeCustom);
                onChange(value);
              }}
              onFocus={(event) => ctx?.handleEvent(event, value, model.onFocusCustom)}
              onBlur={(event) => ctx?.handleEvent(event, value, model.onBlurCustom)}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => {
    const customModel: ITimePickerComponentProps = {
      ...model,
      format: DATE_TIME_FORMAT,
      showNow: true,
      allowClear: true,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<ITimePickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ITimePickerComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ITimePickerComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ITimePickerComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<ITimePickerComponentProps>(4, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<ITimePickerComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  linkToModelMetadata: (model, metadata): ITimePickerComponentProps => {
    return {
      ...model,
      format: metadata.dataFormat ? metadata.dataFormat : DATE_TIME_FORMAT,
    };
  },
};
