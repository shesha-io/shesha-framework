import React, { FC } from 'react';
import { IFormComponent } from '@/interfaces';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Form } from 'antd';
import FormComponentStringDisplay from './formComponentStringDisplay';
import FormComponentDateDisplay from './formComponentDateDisplay';
import FormComponentNumberDisplay from './formComponentNumberDisplay';
import FormComponentBoolDisplay from './formComponentBoolDisplay';

export type IFormComponentProps = IFormComponent;

export const FormComponent: FC<IFormComponentProps> = (props) => {
  const {
    label,
    dataType: { name },
    required,
    info,
  } = props;

  const renderDisplay = (): JSX.Element => {
    switch (name) {
      case 'string':
        return <FormComponentStringDisplay {...props} />;
      case 'date':
        return <FormComponentDateDisplay {...props} />;
      case 'number':
        return <FormComponentNumberDisplay {...props} />;
      case 'boolean':
        return <FormComponentBoolDisplay {...props} />;
      default:
        break;
    }
    return <span />;
  };

  const renderLabel = (): JSX.Element =>
    !info ? (
      <>{label}</>
    ) : (
      <span>
        {label}
        <Tooltip title={info}>
          <InfoCircleOutlined />
        </Tooltip>
      </span>
    );

  return (
    <Form.Item
      className="sha-form-component"
      label={renderLabel()}
      required={required}
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 8,
      }}
    >
      {renderDisplay()}
    </Form.Item>
  );
};

export default FormComponent;
