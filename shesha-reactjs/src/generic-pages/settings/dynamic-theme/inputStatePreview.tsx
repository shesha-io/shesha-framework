import { FC } from 'react';
import { useTheme } from '@/providers';
import { Col, Form, FormItemProps, Input } from 'antd';
import { useStyles } from './styles/styles';

const InputStatesPreview: FC = () => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  const commonProps: FormItemProps = {
    ...(theme.layout ? { layout: theme.layout } : {}),
    ...(theme.labelAlign ? { labelAlign: theme.labelAlign } : {}),
    labelCol: theme.labelSpan ? { span: theme.labelSpan } : {},
    className: styles.fullWidth,
  };

  return (
    <Col span={24}>
      <Form.Item {...commonProps} label="Failed" validateStatus="error" help="Please complete before submission">
        <Input placeholder="Placeholder Text" className={styles.fullWidth} />
      </Form.Item>
      <Form.Item {...commonProps} validateStatus="warning" label="Warning">
        <Input placeholder="Warning Message" prefix={<span style={{ color: '#faad14' }}>⚠</span>} className={styles.fullWidth} />
      </Form.Item>
      <Form.Item {...commonProps} label="Validating" validateStatus="validating" help="Please wait while we validate your input">
        <Input placeholder="Placeholder Text" className={styles.fullWidth} />
      </Form.Item>
      <Form.Item {...commonProps} label="Success" validateStatus="success">
        <Input placeholder="Successful Input" className={styles.fullWidth} />
      </Form.Item>
    </Col>
  );
};

export default InputStatesPreview;
