import ConfigurableFormItem from '../formItem';
import React from 'react';
import { HeartOutlined } from '@ant-design/icons';
import { iconPickerFormSettings } from './settings';
import { IconPickerWrapper } from './iconPickerWrapper';
import { IIconPickerComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useApplicationContext } from '@/providers/form/utils';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

const IconPickerComponent: IToolboxComponent<IIconPickerComponentProps> = {
  type: 'iconPicker',
  name: 'Icon Picker',
  icon: <HeartOutlined />,
  canBeJsSetting: true,
  Factory: ({ model }) => {

    const allData = useApplicationContext();

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<IconPickerWrapper {...model} applicationContext={allData} value={value} onChange={onChange} />)}
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

export default IconPickerComponent;
