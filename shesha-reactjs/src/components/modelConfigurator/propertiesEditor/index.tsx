import React, { FC } from 'react';
import { Form } from 'antd';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { PropertiesEditorProvider } from './provider';
import { PropertiesEditorRenderer } from './renderer';
import { MetadataSourceTypeUseDefined } from '@/apis/modelConfigurations';
import { useModelConfigurator } from '@/providers/modelConfigurator';

export interface IPropertiesEditorProps {
  allowAdd?: boolean | undefined;
  value?: IModelItem[] | undefined;
  onChange?: ((value: IModelItem[]) => void) | undefined;
}

const EMPTY_VALUE: IModelItem[] = [];

export const PropertiesEditor: FC<IPropertiesEditorProps> = (props) => {
  return (
    <PropertiesEditorProvider items={props.value ?? EMPTY_VALUE} onChange={props.onChange}>
      <PropertiesEditorRenderer allowAdd={props.allowAdd} />
    </PropertiesEditorProvider>
  );
};

export const PropertiesEditorComponent: FC = () => {
  const modelConfigurator = useModelConfigurator();

  return (
    <Form.Item
      className="shaPropertiesEditorForm"
      name="properties"
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
    >
      <PropertiesEditor allowAdd={modelConfigurator.modelConfiguration?.source === MetadataSourceTypeUseDefined} />
    </Form.Item>
  );
};
