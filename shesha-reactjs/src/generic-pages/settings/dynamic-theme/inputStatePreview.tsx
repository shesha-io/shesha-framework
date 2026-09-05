import { CSSProperties, FC } from 'react';
import { useTheme } from '@/providers';
import { Col, Form, FormItemProps, Input, Space } from 'antd';

const InputStatesPreview: FC = () => {
  const { theme } = useTheme();

  const commonProps: FormItemProps = {
    ...(theme.layout ? { layout: theme.layout } : {}),
    ...(theme.labelAlign ? { labelAlign: theme.labelAlign } : {}),
    labelCol: theme.labelSpan ? { span: theme.labelSpan } : {},
    style: {
      width: '100%',
    },
  };

  const commonInputStyles: CSSProperties = {
    width: '100%',
  };

  return (
    <Col span={24}>
      <Form.Item {...commonProps} label="Failed" validateStatus="error" help="Please complete before submission">
        <Input placeholder="Placeholder Text" style={commonInputStyles} />
      </Form.Item>
      <Form.Item {...commonProps} validateStatus="warning" label="Warning">
        <Input placeholder="Warning Message" prefix={<span style={{ color: '#faad14' }}>⚠</span>} style={commonInputStyles} />
      </Form.Item>
      <Form.Item {...commonProps} label="Validating" validateStatus="validating" help="Please wait while we validate your input">
        <Input placeholder="Placeholder Text" style={commonInputStyles} />
      </Form.Item>
      <Form.Item {...commonProps} label="Success" validateStatus="success">
        <Input placeholder="Successful Input" style={commonInputStyles} />
      </Form.Item>
    </Col>
  );
};

export default InputStatesPreview;
