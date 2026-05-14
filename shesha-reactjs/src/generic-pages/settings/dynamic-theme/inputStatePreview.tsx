import React, { FC } from 'react';
import { useTheme } from '@/providers';
import { Form, Input, Space } from 'antd';
import { FormItemProps } from 'antd/lib';

const InputStatesPreview: FC = () => {
    const { theme } = useTheme();

    const commonProps: FormItemProps = {
        layout: theme.layout,
        labelAlign: theme.labelAlign,
        labelCol: { span: theme.labelSpan }
    };

    return <Space>
        <Form.Item {...commonProps} label="Failed" validateStatus="error" help="Please complete before submission">
            <Input size='small' placeholder="Placeholder Text" />
        </Form.Item>
        <Form.Item {...commonProps} label="Warning">
            <Input size='small' placeholder="Warning Message" prefix={<span style={{ color: '#faad14' }}>⚠</span>} />
        </Form.Item>
        <Form.Item {...commonProps} label="Validating" help="Please wait while we validate your input">
            <Input size='small' placeholder="Placeholder Text" />
        </Form.Item>
        <Form.Item {...commonProps} label="Success">
            <Input size='small' placeholder="Successful Input" />
        </Form.Item>
    </Space>;
};

export default InputStatesPreview;
