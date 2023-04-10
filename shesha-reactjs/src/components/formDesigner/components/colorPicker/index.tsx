import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormatPainterOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { iconPickerFormSettings } from './settings';
import ColorPicker from '../../../colorPicker';
import { ColorResult } from 'react-color';
import { IColorPickerComponentProps } from './interfaces';

const ColorPickerComponent: IToolboxComponent<IColorPickerComponentProps> = {
  type: 'colorPicker',
  name: 'Color Picker',
  icon: <FormatPainterOutlined />,
  factory: (model: IColorPickerComponentProps) => {
    return (
      <ConfigurableFormItem model={model}>
        <ColorPickerWrapper {...model} />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
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
