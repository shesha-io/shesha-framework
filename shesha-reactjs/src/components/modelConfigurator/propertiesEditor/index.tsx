import React, { FC } from 'react';
import { PropertiesEditorRenderer } from './renderer';
import { PropertiesEditorProvider } from './provider';
import { IModelItem } from '../../../interfaces/modelConfigurator';
import { Form } from 'antd';

export interface IPropertiesEditorComponentProps {
}
export const PropertiesEditorComponent: FC<IPropertiesEditorComponentProps> = () => {
 return (
    <Form.Item
        name="properties"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
    >
        <PropertiesEditor />
    </Form.Item>
 );   
}

export interface IPropertiesEditorProps extends IPropertiesEditorComponentProps {
    value?: IModelItem[];
    onChange?: (value: IModelItem[]) => void;    
}

export const PropertiesEditor: FC<IPropertiesEditorProps> = (props) => {
    return (
        <PropertiesEditorProvider items={props.value} onChange={props.onChange}>
            <PropertiesEditorRenderer />
        </PropertiesEditorProvider>
    );
}