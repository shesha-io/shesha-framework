import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { DataTypes } from '@/interfaces/dataTypes';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import Box from './components/box';
import { IStyleBoxComponentProps, StyleBoxDefinition } from './interfaces';
import { getSettings } from './settings';
import { getStyleBoxValue } from './utils';

const StyleBox: StyleBoxDefinition = {
  type: 'styleBox',
  name: 'Style Box',
  icon: <StrikethroughOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model: passedModel }) => {
    const { size, ...model } = passedModel;

    return model.hidden ? null : (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const json = getStyleBoxValue(value);
          const internalOnChange = (newValue: object): void => onChange(model.format === 'json' ? newValue : JSON.stringify(newValue));
          return <Box value={json} onChange={internalOnChange} readOnly={model.readOnly} propertyName={model.propertyName} />;
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      label: 'Style Box',
    };
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<IStyleBoxComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IStyleBoxComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IStyleBoxComponentProps>(2, (prev) => migrateReadOnly(prev)),
};

export default StyleBox;
