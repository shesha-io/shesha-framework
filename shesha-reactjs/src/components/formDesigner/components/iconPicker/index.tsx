import React, { CSSProperties, ReactNode, useMemo } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { HeartOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import IconPicker, { ShaIconTypes } from '../../../iconPicker';
import { executeScriptSync } from '../../../..';
import { iconPickerFormSettings } from './settings';
import { IIconPickerComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';

const IconPickerComponent: IToolboxComponent<IIconPickerComponentProps> = {
  type: 'iconPicker',
  name: 'Icon Picker',
  icon: <HeartOutlined />,
  canBeJsSetting: true,
  factory: (model: IIconPickerComponentProps, _cr, _f, _c, applicationContext) => {
    const { customColor, customIcon, fontSize, color, disabled, readOnly, } = model;
    
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const computedColor = useMemo(() => {
            if (customColor) return executeScriptSync<string>(customColor, applicationContext);
        
            return color?.hex;
          }, [applicationContext, customColor]);
        
          const computedIcon = useMemo(() => {
            if (customIcon) return executeScriptSync<string>(customIcon, applicationContext);
        
            return value;
          }, [applicationContext, customIcon]);
        
          const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
            if (onChange) onChange(iconName);
          };
        
          const style: CSSProperties = {
            fontSize: fontSize || 24,
            color: computedColor,
          };
        
          return (
            <IconPicker
              value={computedIcon as ShaIconTypes}
              onIconChange={onIconChange}
              readOnly={readOnly || disabled}
              style={style}
              twoToneColor={computedColor}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
  migrator: (m) => m
    .add<IIconPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default IconPickerComponent;
