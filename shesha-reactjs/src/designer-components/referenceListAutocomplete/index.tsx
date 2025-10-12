import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import React from 'react';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { IConfigurableItemAutocompleteComponentProps } from '../configurableItemAutocomplete/interfaces';

export type IReferenceListAutocompleteProps = IConfigurableFormComponent;

/**
 * @deprecated. Use ConfigurableItemAutocompleteComponent instead
 */
const ReferenceListAutocompleteComponent: IToolboxComponent<IReferenceListAutocompleteProps> = {
  type: 'referenceListAutocomplete',
  name: 'Reference List Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  Factory: () => {
    throw new Error('Reference List Autocomplete component was removed');
  },
  migrator: (m) => m
    .add<IReferenceListAutocompleteProps>(0, (prev) => ({ ...prev, convertToFullId: true }))
    .add<IReferenceListAutocompleteProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IReferenceListAutocompleteProps>(2, (prev) => migrateReadOnly(prev))
    .add<IConfigurableItemAutocompleteComponentProps>(3, (prev) => {
      return {
        ...prev,
        mode: 'single',
        type: 'configurableItemAutocomplete',
        version: 0,
        entityType: 'Shesha.Framework.ReferenceList',
      };
    }),
};

export default ReferenceListAutocompleteComponent;
