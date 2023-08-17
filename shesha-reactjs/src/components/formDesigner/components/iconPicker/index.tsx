import React, { CSSProperties, FC, ReactNode, useMemo } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { HeartOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import IconPicker, { ShaIconTypes } from '../../../iconPicker';
import { executeScriptSync, useForm, useFormData, useGlobalState } from '../../../..';
import { iconPickerFormSettings } from './settings';
import { IIconPickerComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const IconPickerComponent: IToolboxComponent<IIconPickerComponentProps> = {
  type: 'iconPicker',
  name: 'Icon Picker',
  icon: <HeartOutlined />,
  canBeJsSetting: true,
  factory: (model: IIconPickerComponentProps) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <IconPickerWrapper {...model} value={value} onChange={onChange}/>}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
  migrator: (m) => m
    .add<IIconPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
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
  const { formMode } = useForm();
  const { data: formData } = useFormData();
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
