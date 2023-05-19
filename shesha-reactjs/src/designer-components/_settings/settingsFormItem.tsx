import React, { FC } from 'react';
import { Form, FormItemProps } from "antd";

interface ISettingsFormItemProps extends FormItemProps<any> {
    propertyFilter?: (name: string) => boolean;
}
  
const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
    return !Boolean(props.propertyFilter) || typeof props.propertyFilter === 'function' && props.propertyFilter(props.name?.toString())
        ? <Form.Item {...props}/>
        : null;
};

export default SettingsFormItem;