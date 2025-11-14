import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getAllEventHandlers } from '@/components/formDesigner/components/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { TimePickerWrapper } from './timePickerWrapper';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settings';
import { IDateFieldProps } from '../dateField/interfaces';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { ITimePickerComponentProps, TimeFieldComponentDefinition } from './models';

const DATE_TIME_FORMAT = 'HH:mm';

export const TimeFieldComponent: TimeFieldComponentDefinition = {
  type: 'timePicker',
  name: 'Time Picker',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.time,
  calculateModel: (model, allData) => ({
    eventHandlers: getAllEventHandlers(model, allData),
  }),
  Factory: ({ model, calculatedModel }) => {
    const finalStyle = !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles.fontStyles,
      ...model.allStyles.dimensionsStyles,
    } : model.allStyles.fullStyle;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;
          const onChangeInternal = (value: any | null, timeString: string | [string, string]): void => {
            customEvents.onChange({ value, timeString });
            if (typeof onChange === 'function') onChange(value, timeString);
          };
          return (
            <TimePickerWrapper
              {...model}
              {...customEvents}
              style={finalStyle}
              value={value}
              onChange={onChangeInternal}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => {
    const customModel: ITimePickerComponentProps = {
      ...model,
      format: DATE_TIME_FORMAT,
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
    .add<IDateFieldProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  linkToModelMetadata: (model, metadata): ITimePickerComponentProps => {
    return {
      ...model,
      format: metadata.dataFormat ? metadata.dataFormat : DATE_TIME_FORMAT,
    };
  },
};
