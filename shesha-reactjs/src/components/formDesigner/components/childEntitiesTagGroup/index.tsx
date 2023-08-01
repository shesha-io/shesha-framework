import { UnorderedListOutlined } from '@ant-design/icons';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { useForm } from '../../../../providers';
import ConfigurableFormItem from '../formItem';
import ChildEntitiesTagGroupControl from './control';
import { IChildEntitiesTagGroupProps } from './models';
import { ChildEntitiesTagGroupSettings } from './settings';

const ChildEntitiesTagGroup: IToolboxComponent<IChildEntitiesTagGroupProps> = {
  type: 'childEntitiesTagGroup',
  name: 'Child Entities Tag Group',
  icon: <UnorderedListOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: (model: IChildEntitiesTagGroupProps) => {
    const { isComponentHidden, formMode } = useForm();

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>
          <ChildEntitiesTagGroupControl model={model} formMode={formMode} value={value} onChange={onChange} />
        }
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ChildEntitiesTagGroupSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  migrator: (m) => m
    .add<IChildEntitiesTagGroupProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default ChildEntitiesTagGroup;
