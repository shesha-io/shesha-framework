import React, { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { GenericConfigItemAutocomplete, ConfigurableItemAutocompleteRuntimeProps, StandardAutocompleteProps } from './generic';


export type IReferenceListAutocompleteRuntimeProps = ConfigurableItemAutocompleteRuntimeProps<FormFullName, Omit<StandardAutocompleteProps, 'entityType' | 'filter'>>;

const REFERENCE_LIST_ENTITY_TYPE = 'Shesha.Framework.ReferenceList';

export const ReferenceListAutocomplete: FC<IReferenceListAutocompleteRuntimeProps> = (props) => {
  return (
    <GenericConfigItemAutocomplete
      {...props}
      entityType={REFERENCE_LIST_ENTITY_TYPE}
    />
  );
};
