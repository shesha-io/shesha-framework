import { UnorderedListOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions } from '../../../../designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import ConfigurableFormItem from '../formItem';
import ChildEntitiesTagGroupControl from './control';
import { IChildEntitiesTagGroupProps } from './models';
import { ChildEntitiesTagGroupSettingsForm } from './settings';

const ChildEntitiesTagGroup: IToolboxComponent<IChildEntitiesTagGroupProps> = {
  type: 'childEntitiesTagGroup',
  name: 'Child Entities Tag Group',
  icon: <UnorderedListOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: (model: IChildEntitiesTagGroupProps) => {
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
  ,
};

export default ChildEntitiesTagGroup;
