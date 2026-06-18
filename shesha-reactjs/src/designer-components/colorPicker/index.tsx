import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import React from 'react';
import { FormatPainterOutlined } from '@ant-design/icons';
import { ColorPickerComponentDefinition, IColorPickerComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ColorPicker } from '@/components/colorPicker';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ColorValueType } from 'antd/es/color-picker/interface';

const ColorPickerComponent: ColorPickerComponentDefinition = {
  type: 'colorPicker',
  name: 'Color Picker',
  canBeJsSetting: true,
  isInput: true,
  isOutput: true,
  icon: <FormatPainterOutlined />,
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem<ColorValueType> model={model}>
        {(value, onChange, _, ctx) => {
          return (
            <ColorPicker
              value={value}
              {...model}
              readOnly={model.readOnly ?? false}
              style={model.allStyles?.fullStyle ?? {}}
              onChange={(newValue) => {
                ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                onChange(newValue);
              }}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  migrator: (m) => m
    .add<IColorPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IColorPickerComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IColorPickerComponentProps>(2, (prev) => ({ ...prev, allowClear: false, showText: false }))
    .add<IColorPickerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) })),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default ColorPickerComponent;
