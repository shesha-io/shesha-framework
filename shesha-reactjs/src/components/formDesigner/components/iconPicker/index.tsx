import React, { CSSProperties, FC, ReactNode, useMemo } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { HeartOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import IconPicker, { ShaIconTypes } from '../../../iconPicker';
import { executeScriptSync, useForm, useGlobalState } from '../../../..';
import { iconPickerFormSettings } from './settings';
import { ColorResult } from 'react-color';

export interface IIconPickerComponentProps extends IConfigurableFormComponent {
  readOnly?: boolean;
  fontSize?: number;
  color?: ColorResult;
  customIcon?: string;
  customColor?: string;
}

const IconPickerComponent: IToolboxComponent<IIconPickerComponentProps> = {
  type: 'iconPicker',
  name: 'Icon Picker',
  icon: <HeartOutlined />,
  factory: (model: IIconPickerComponentProps) => {
    return (
      <ConfigurableFormItem model={model}>
        <IconPickerWrapper {...model} />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
};

export interface IIconPickerWrapperProps extends IIconPickerComponentProps {
  value?: string;
  onChange?: (value?: string) => void;
}

export const IconPickerWrapper: FC<IIconPickerWrapperProps> = ({
  customColor,
  customIcon,
  value,
  fontSize,
  color,
  ...props
}) => {
  const { formMode, formData } = useForm();
  const { globalState } = useGlobalState();

  const expressionArgs = { data: formData, globalState };

  const computedColor = useMemo(() => {
    if (customColor) return executeScriptSync<string>(customColor, expressionArgs);

    return color?.hex;
  }, [expressionArgs, customColor]);

  const computedIcon = useMemo(() => {
    if (customIcon) return executeScriptSync<string>(customIcon, expressionArgs);

    return value;
  }, [expressionArgs, customIcon]);

  const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
    if (props.onChange) props.onChange(iconName);
  };

  const style: CSSProperties = {
    fontSize: fontSize || 24,
    color: computedColor,
  };

  return (
    <IconPicker
      value={computedIcon as ShaIconTypes}
      onIconChange={onIconChange}
      readOnly={formMode === 'readonly'}
      style={style}
      twoToneColor={computedColor}
    />
  );
};

export default IconPickerComponent;
