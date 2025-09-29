import { IToolboxComponent } from '@/interfaces';
import { FileSearchOutlined } from '@ant-design/icons';
import React from 'react';
import { IFormAutocompleteComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { IConfigurableItemAutocompleteComponentProps } from '../configurableItemAutocomplete/interfaces';

/**
 * @deprecated. Use ConfigurableItemAutocompleteComponent instead
 */
const FormAutocompleteComponent: IToolboxComponent<IFormAutocompleteComponentProps> = {
  type: 'formAutocomplete',
  name: 'Form Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: () => {
    throw new Error('Form Autocomplete component was removed');
  },
  migrator: (m) => m
    .add<IFormAutocompleteComponentProps>(0, (prev) => ({ ...prev, convertToFullId: true }))
    .add<IFormAutocompleteComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IFormAutocompleteComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<IConfigurableItemAutocompleteComponentProps>(3, (prev) => {
      return {
        ...prev,
        type: 'configurableItemAutocomplete',
        version: 0,
        mode: 'single',
        entityType: 'Shesha.Core.FormConfiguration',
        filter: {
          "==": [{ var: "isTemplate" }, false],
        },
      };
    }),
};

export default FormAutocompleteComponent;
