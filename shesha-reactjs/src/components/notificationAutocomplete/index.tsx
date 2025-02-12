import { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { ConfigurableItemAutocomplete } from '../configurableItemAutocomplete';
import React from 'react';

export interface INotificationAutocompleteRuntimeProps {
    value?: FormFullName;
    onChange?: (value?: FormFullName) => void;
    readOnly?: boolean;
    maxResultCount?: number;
}

const NOTIFICATION_CONFIG_ENTITY_TYPE = 'Shesha.Domain.NotificationTypeConfig';

export const NotificationAutocomplete: FC<INotificationAutocompleteRuntimeProps> = (props) => {
    return (
        <ConfigurableItemAutocomplete
            entityType={NOTIFICATION_CONFIG_ENTITY_TYPE}
            readOnly={props.readOnly}
            value={props.value}
            onChange={props.onChange}
            mode='single'
        />
    );
};