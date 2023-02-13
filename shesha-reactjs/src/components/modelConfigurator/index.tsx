import { Form } from 'antd';
import React, { FC, MutableRefObject } from 'react';
import { ModelConfiguratorProvider } from '../..';
import { IModelConfiguratorInstance } from '../../providers/modelConfigurator/interfaces';
import { ModelConfiguratorRenderer } from './renderer';

export interface IModelConfiguratorProps {
  id?: string;
  name?: string;
  nameSpace?: string;
  configuratorRef?: MutableRefObject<IModelConfiguratorInstance | null>;
}

export const ModelConfigurator: FC<IModelConfiguratorProps> = (props) => {
  const [form] = Form.useForm();

  return (
    <ModelConfiguratorProvider 
      id={props.id}
      form={form}
      configuratorRef={props.configuratorRef}
    >
      {props.id != null && <ModelConfiguratorRenderer />}
    </ModelConfiguratorProvider>
  );
};

export default ModelConfigurator;