import React, { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { GenericConfigItemAutocomplete, ConfigurableItemAutocompleteRuntimeProps, StandardAutocompleteProps } from './generic';


export type INotificationChannelAutocompleteRuntimeProps = ConfigurableItemAutocompleteRuntimeProps<FormFullName, Omit<StandardAutocompleteProps, 'entityType' | 'filter'>>;

const NOTIFICATION_CONFIG_ENTITY_TYPE = 'Shesha.Domain.NotificationChannelConfig';

export const NotificationChannelAutocomplete: FC<INotificationChannelAutocompleteRuntimeProps> = (props) => {
  return (
    <GenericConfigItemAutocomplete
      {...props}
      entityType={NOTIFICATION_CONFIG_ENTITY_TYPE}
    />
  );
};
