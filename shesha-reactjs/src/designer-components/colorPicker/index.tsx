import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { FormatPainterOutlined } from '@ant-design/icons';
import { IColorPickerComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ColorPicker } from '@/components';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getEventHandlers } from '@/components/formDesigner/components/utils';

const ColorPickerComponent: IToolboxComponent<IColorPickerComponentProps> = {
  type: 'colorPicker',
  name: 'Color Picker',
  canBeJsSetting: true,
  isInput: true,
  isOutput: true,
  icon: <FormatPainterOutlined />,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData();
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const customEvents = getEventHandlers(model, allData);
          const onChangeInternal = (colorValue) => {
            //allow onchange to pass value as a property of target
            //@ts-ignore 
            customEvents.onChange({ target: { value: colorValue }, currentTarget: { value: colorValue } });
            if (typeof onChange === 'function') onChange(colorValue);
          };
          
          return (
            <ColorPicker
              value={value}
              onChange={onChangeInternal}
              title={model.title}
              allowClear={model.allowClear}
              showText={model.showText}
              disabledAlpha={model.disabledAlpha}
              readOnly={model.readOnly}
              size={model.size}
              {...model}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m
    .add<IColorPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IColorPickerComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IColorPickerComponentProps>(2, (prev) => ({ ...prev, allowClear: false, showText: false }))
    .add<IColorPickerComponentProps>(3, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
  validateSettings: model => validateConfigurableComponentSettings(getSettings, model),
};

export default ColorPickerComponent;