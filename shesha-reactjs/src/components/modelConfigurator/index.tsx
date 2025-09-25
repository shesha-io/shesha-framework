import React, { FC, MutableRefObject } from 'react';
import { Form } from 'antd';
import { IModelConfiguratorInstance } from '@/providers/modelConfigurator/interfaces';
import { ModelConfiguratorProvider } from '@/providers';
import { CreateModelModal } from './createModelModal/createModelModal';
import { EntityConfiguratorPage } from '@/index';

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
    >
      <EntityConfiguratorPage />
      <CreateModelModal />
    </ModelConfiguratorProvider>
  );
};

export default ModelConfigurator;
