import React, { FC } from 'react';
import { FormFullName } from '@/providers/form/models';
import { GenericConfigItemAutocomplete, ConfigurableItemAutocompleteRuntimeProps, StandardAutocompleteProps } from './generic';


export type IRoleAutocompleteRuntimeProps = ConfigurableItemAutocompleteRuntimeProps<FormFullName, Omit<StandardAutocompleteProps, 'entityType' | 'filter'>>;

const ROLE_ENTITY_TYPE = 'Shesha.Domain.ShaRole';

export const RoleAutocomplete: FC<IRoleAutocompleteRuntimeProps> = (props) => {
  return (
    <GenericConfigItemAutocomplete
      {...props}
      entityType={ROLE_ENTITY_TYPE}
    />
  );
};
