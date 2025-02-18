import { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { ConfigurableItemAutocomplete } from '../configurableItemAutocomplete';
import React from 'react';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IFormAutocompleteRuntimeProps {
    value?: FormFullName;
    onChange?: (value?: FormFullName) => void;
    readOnly?: boolean;
    maxResultCount?: number;
    size?: SizeType;
}

const FORM_CONFIG_ENTITY_TYPE = 'Shesha.Core.FormConfiguration';

const baseFormFilter = {
    "==": [{ "var": "isTemplate" }, false]
};

export const FormAutocomplete: FC<IFormAutocompleteRuntimeProps> = (props) => {
    return (
        <ConfigurableItemAutocomplete
            size={props.size}
            entityType={FORM_CONFIG_ENTITY_TYPE}
            readOnly={props.readOnly}
            value={props.value}
            onChange={props.onChange}
            mode='single'
            filter={baseFormFilter}
        />
    );
};