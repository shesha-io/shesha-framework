import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { HeartOutlined } from '@ant-design/icons';
import {formSettings} from './settings';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import KeyInformationBar, { KeyInformationBarProps } from '@/components/keyInformationBar';

const KeyInformationBarComponent: IToolboxComponent<KeyInformationBarProps> = {
  type: 'KeyInformationBar',
  name: 'Key Information Bar',
  icon: <HeartOutlined />,
  canBeJsSetting: true,
  Factory: ({ model }) => {

    return (
      <ConfigurableFormItem model={model}>
        <KeyInformationBar {...model} />
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
