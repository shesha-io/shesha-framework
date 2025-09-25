import { IToolboxComponent } from '@/interfaces';
import { FileSearchOutlined } from '@ant-design/icons';
import React from 'react';
import { INotificationAutocompleteComponentProps } from './interfaces';
import { IConfigurableItemAutocompleteComponentProps } from '../configurableItemAutocomplete/interfaces';

/**
 * @deprecated. Use ConfigurableItemAutocompleteComponent instead
 */
const NotificationAutocompleteComponent: IToolboxComponent<INotificationAutocompleteComponentProps> = {
  type: 'notificationAutocomplete',
  name: 'Notification Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: () => {
    throw new Error('Notification Autocomplete component was removed');
  },
  migrator: (m) => m
    .add<IConfigurableItemAutocompleteComponentProps>(0, (prev) => {
      return {
        ...prev,
        type: 'configurableItemAutocomplete',
        version: 0,
        mode: 'single',
        entityType: 'Shesha.Domain.NotificationTypeConfig',
      };
    }),
};

export default NotificationAutocompleteComponent;
