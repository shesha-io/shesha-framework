import ConfigurableFormItem from '../formItem';
import React from 'react';
import { ColorPickerWrapper } from './colorPickerWrapper';
import { FormatPainterOutlined } from '@ant-design/icons';
import { IColorPickerComponentProps } from './interfaces';
import { iconPickerFormSettings } from './settings';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

const ColorPickerComponent: IToolboxComponent<IColorPickerComponentProps> = {
  type: 'colorPicker',
  name: 'Color Picker',
  icon: <FormatPainterOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<ColorPickerWrapper {...model} value={value} onChange={onChange} />)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  migrator: (m) => m
    .add<IColorPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IColorPickerComponentProps>(1, (prev) => migrateVisibility(prev))
  ,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
};

export default ColorPickerComponent;
