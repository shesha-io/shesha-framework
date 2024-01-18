import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '../formItem';
import Box from './components/box';
import { IStyleBoxComponentProps } from './interfaces';
import { getSettings } from './settings';

const StyleBox: IToolboxComponent<IStyleBoxComponentProps> = {
  type: 'styleBox',
  name: 'Style Box',
  icon: <StrikethroughOutlined />,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  Factory: ({ model: passedModel }) => {
    const { size, ...model } = passedModel;

    return (
      <ConfigurableFormItem model={model} initialValue={model?.defaultValue}>
        {(value, onChange) => <Box value={value} onChange={onChange} readOnly={model.readOnly} />}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      label: 'Style Box',
    };
  },
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  migrator: (m) =>
    m
      .add<IStyleBoxComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IStyleBoxComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IStyleBoxComponentProps>(2, (prev) => migrateReadOnly(prev)),
};

export default StyleBox;
