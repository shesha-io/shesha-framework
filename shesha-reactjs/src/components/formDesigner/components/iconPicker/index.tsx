import ConfigurableFormItem from '../formItem';
import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
  CSSProperties,
  FC,
  ReactNode,
  useMemo
  } from 'react';
import { ColorResult } from 'react-color';
import { executeScriptSync, IApplicationContext } from '@/providers/form/utils';
import { HeartOutlined } from '@ant-design/icons';
import { iconPickerFormSettings } from './settings';
import { IIconPickerComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

const IconPickerComponent: IToolboxComponent<IIconPickerComponentProps> = {
  type: 'iconPicker',
  name: 'Icon Picker',
  icon: <HeartOutlined />,
  canBeJsSetting: true,
  Factory: ({ model, context: applicationContext }) => {

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<IconPickerWrapper {...model} applicationContext={applicationContext} value={value} onChange={onChange} />)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
  migrator: (m) => m
    .add<IIconPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IIconPickerComponentProps>(1, (prev) => migrateVisibility(prev))
  ,
};

interface IconPickerWrapperProps {
  disabled?: boolean; // todo: move to the model level
  applicationContext: IApplicationContext;
  value: any;
  onChange: (...args: any[]) => void;
  readOnly?: boolean;
  fontSize?: number;
  color?: ColorResult;
  customIcon?: string;
  customColor?: string;  
}
const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
  const { customColor, customIcon, fontSize, color, readOnly, applicationContext, value, onChange } = props;
  const computedColor = useMemo(() => {
    if (customColor) return executeScriptSync<string>(customColor, applicationContext);

    return color?.hex;
  }, [applicationContext, customColor, color]);

  const computedIcon = useMemo(() => {
    if (customIcon) return executeScriptSync<string>(customIcon, applicationContext);

    return value;
  }, [applicationContext, customIcon, value]);

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
      readOnly={readOnly}
      style={style}
      twoToneColor={computedColor}
    />
  );
};

export default IconPickerComponent;
