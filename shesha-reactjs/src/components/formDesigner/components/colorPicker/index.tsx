import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormatPainterOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { iconPickerFormSettings } from './settings';
import ColorPicker from '../../../colorPicker';
import { ColorResult } from 'react-color';
import { IColorPickerComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';

const ColorPickerComponent: IToolboxComponent<IColorPickerComponentProps> = {
  type: 'colorPicker',
  name: 'Color Picker',
  icon: <FormatPainterOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<ColorPickerWrapper {...model} value={value} onChange={onChange}/>)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  migrator: (m) => m
    .add<IColorPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
};

export interface IColorPickerWrapperProps {
  value?: ColorResult;
  onChange?: (color: ColorResult) => void;
  title?: string;
  color?: ColorResult;
}

export const ColorPickerWrapper: FC<IColorPickerWrapperProps> = ({ value, ...props }) => {
  return <ColorPicker {...props} color={value} />;
};

export default ColorPickerComponent;
