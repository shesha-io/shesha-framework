import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { HeartOutlined } from '@ant-design/icons';
import {formSettings} from './settings';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import KeyInformationBar, { KeyInformationBarProps } from '@/components/keyInformationBar';
import { useForm, useFormData, useGlobalState } from '@/providers';

const KeyInformationBarComponent: IToolboxComponent<KeyInformationBarProps> = {
  type: 'KeyInformationBar',
  name: 'Key Information Bar',
  icon: <HeartOutlined />,
  canBeJsSetting: true,
  Factory: ({ model }) => {

    const { data: formData } = useFormData();
    const props = {
      ...model,
      style: model?.style,
      formData
    }
    return (
      <ConfigurableFormItem model={model}>
        <KeyInformationBar {...model} direction={model.direction}/>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: formSettings,
  validateSettings: model => validateConfigurableComponentSettings(formSettings, model),
  migrator: (m) => m
    .add<KeyInformationBarProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<KeyInformationBarProps>(1, (prev) => migrateVisibility(prev))
  ,
};

export default KeyInformationBarComponent;
