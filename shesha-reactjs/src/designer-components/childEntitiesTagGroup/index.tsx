import { UnorderedListOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ChildEntitiesTagGroupControl from './control';
import { IChildEntitiesTagGroupProps } from './models';
import { ChildEntitiesTagGroupSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const ChildEntitiesTagGroup: IToolboxComponent<IChildEntitiesTagGroupProps> = {
  type: 'childEntitiesTagGroup',
  name: 'Child Entities Tag Group',
  icon: <UnorderedListOutlined />,
  isInput: true,
  isOutput: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>
          <ChildEntitiesTagGroupControl model={model} value={value} onChange={onChange} componentName={model.componentName} />}
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: (props) => (<ChildEntitiesTagGroupSettingsForm {...props} />),
  migrator: (m) => m
    .add<IChildEntitiesTagGroupProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IChildEntitiesTagGroupProps>(1, (prev) => migrateVisibility(prev))
    .add<IChildEntitiesTagGroupProps>(2, (prev) => migrateReadOnly(prev))
    .add<IChildEntitiesTagGroupProps>(3, (prev) => ({
      ...migrateFormApi.eventsAndProperties(prev),
      labelFormat: migrateFormApi.withoutFormData(prev?.defaultValue),
    })),
};

export default ChildEntitiesTagGroup;
