import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { HeartOutlined } from '@ant-design/icons';
import { iconPickerFormSettings } from './settings';
import { IconPickerWrapper } from './iconPickerWrapper';
import { IIconPickerComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const IconPickerComponent: IToolboxComponent<IIconPickerComponentProps> = {
  type: 'iconPicker',
  name: 'Icon',
  icon: <HeartOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model, form }) => {

    const allData = useAvailableConstantsData();

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<IconPickerWrapper form={{form}} model={model} {...model} applicationContext={allData} value={value} onChange={onChange} />)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: iconPickerFormSettings,
  validateSettings: model => validateConfigurableComponentSettings(iconPickerFormSettings, model),
  migrator: (m) => m
    .add<IIconPickerComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IIconPickerComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IIconPickerComponentProps>(2, (prev) => ({ ...prev, color: legacyColor2Hex(prev.color) }))
    .add<IIconPickerComponentProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
  ,
};

export default IconPickerComponent;
