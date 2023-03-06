import { UnorderedListOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { useForm } from '../../../../providers';
import ConfigurableFormItem from '../formItem';
import JsonEntityControl from './control';
import { IJsonEntityProps } from './models';
import { JsonEntitySettings } from './settings';

const JsonEntity: IToolboxComponent<IJsonEntityProps> = {
  type: 'jsonEntity',
  name: 'JSON Entity',
  icon: <UnorderedListOutlined />,
  factory: (model: IJsonEntityProps) => {
    const { isComponentHidden, formMode } = useForm();

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        <JsonEntityControl model={model} formMode={formMode} />
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <JsonEntitySettings
        readOnly={readOnly}
        model={model}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
};

export default JsonEntity;
