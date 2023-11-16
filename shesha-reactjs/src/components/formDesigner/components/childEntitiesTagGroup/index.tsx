import { UnorderedListOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions } from '../../../../designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import ConfigurableFormItem from '../formItem';
import ChildEntitiesTagGroupControl from './control';
import { IChildEntitiesTagGroupProps } from './models';
import { ChildEntitiesTagGroupSettingsForm } from './settings';
import { migrateVisibility } from 'designer-components/_common-migrations/migrateVisibility';

const ChildEntitiesTagGroup: IToolboxComponent<IChildEntitiesTagGroupProps> = {
  type: 'childEntitiesTagGroup',
  name: 'Child Entities Tag Group',
  icon: <UnorderedListOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>
          <ChildEntitiesTagGroupControl model={model} value={value} onChange={onChange} />
        }
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: (props) => ( <ChildEntitiesTagGroupSettingsForm {...props}/>),
  migrator: (m) => m
    .add<IChildEntitiesTagGroupProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IChildEntitiesTagGroupProps>(1, (prev) => migrateVisibility(prev))
  ,
};

export default ChildEntitiesTagGroup;
