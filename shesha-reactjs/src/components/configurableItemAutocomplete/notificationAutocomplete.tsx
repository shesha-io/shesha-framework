import React, { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { GenericConfigItemAutocomplete, ConfigurableItemAutocompleteRuntimeProps, StandardAutocompleteProps } from './generic';


export type INotificationAutocompleteRuntimeProps = ConfigurableItemAutocompleteRuntimeProps<FormFullName, Omit<StandardAutocompleteProps, 'entityType' | 'filter'>>;

const NOTIFICATION_CONFIG_ENTITY_TYPE = 'Shesha.Domain.NotificationTypeConfig';

export const NotificationAutocomplete: FC<INotificationAutocompleteRuntimeProps> = (props) => {
  return (
    <GenericConfigItemAutocomplete
      {...props}
      entityType={NOTIFICATION_CONFIG_ENTITY_TYPE}
    />
  );
};
