import { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { ConfigurableItemAutocomplete } from '../configurableItemAutocomplete';
import React from 'react';

export interface IFormAutocompleteRuntimeProps {
    value?: FormFullName;
    onChange?: (value?: FormFullName) => void;
    readOnly?: boolean;
    maxResultCount?: number;
}

const FORM_CONFIG_ENTITY_TYPE = 'Shesha.Core.FormConfiguration';

const baseFormFilter = {
    "==": [{ "var": "isTemplate" }, false]
};

export const FormAutocomplete: FC<IFormAutocompleteRuntimeProps> = (props) => {
    return (
        <ConfigurableItemAutocomplete
            entityType={FORM_CONFIG_ENTITY_TYPE}
            readOnly={props.readOnly}
            value={props.value}
            onChange={props.onChange}
            mode='single'
            filter={baseFormFilter}
        />
    );
};