import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { NotificationAutocomplete } from '@/components/notificationAutocomplete';
import { INotificationAutocompleteComponentProps } from './interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const NotificationAutocompleteComponent: IToolboxComponent<INotificationAutocompleteComponentProps> = {
  type: 'notificationAutocomplete',
  name: 'Notification Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => 
          <NotificationAutocomplete
            readOnly={model.readOnly}
            value={value}
            onChange={onChange}
          />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  /*
  migrator: m => m
    .add<IFormAutocompleteComponentProps>(0, prev => ({ ...prev, convertToFullId: true }))
    .add<IFormAutocompleteComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IFormAutocompleteComponentProps>(2, (prev) => migrateReadOnly(prev))
  ,
  */
};

export default NotificationAutocompleteComponent;
