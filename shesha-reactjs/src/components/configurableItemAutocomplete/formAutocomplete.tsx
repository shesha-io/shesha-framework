import React, { FC } from 'react';
import { GenericConfigItemAutocomplete, ConfigurableItemAutocompleteRuntimeProps, StandardAutocompleteProps } from './generic';

import { FormFullName } from '@/interfaces';

export type IFormAutocompleteRuntimeProps = ConfigurableItemAutocompleteRuntimeProps<FormFullName, Omit<StandardAutocompleteProps, 'entityType' | 'filter'>>;

const FORM_CONFIG_ENTITY_TYPE = 'Shesha.Core.FormConfiguration';

const baseFormFilter = {
  "==": [{ var: "isTemplate" }, false],
};

export const FormAutocomplete: FC<IFormAutocompleteRuntimeProps> = (props) => {
  return (
    <GenericConfigItemAutocomplete
      {...props}
      entityType={FORM_CONFIG_ENTITY_TYPE}
      filter={baseFormFilter}
    />
  );
};
