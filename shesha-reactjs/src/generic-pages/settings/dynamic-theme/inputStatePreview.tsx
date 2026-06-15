import React, { FC } from "react";
import { useTheme } from "@/providers";
import { Form, FormItemProps, Input, Space } from "antd";

const InputStatesPreview: FC = () => {
  const { theme } = useTheme();

  const componentSpan = theme.layout === "vertical" ? 24 : theme.componentSpan;
  const commonProps: FormItemProps = {
    ...(theme.layout ? { layout: theme.layout } : {}),
    ...(theme.labelAlign ? { labelAlign: theme.labelAlign } : {}),
    labelCol: theme.labelSpan ? { span: theme.labelSpan } : {},
    wrapperCol: { span: componentSpan },
  };

  return (
    <Space>
      <Form.Item
        {...commonProps}
        label="Failed"
        validateStatus="error"
        help="Please complete before submission"
      >
        <Input placeholder="Placeholder Text" />
      </Form.Item>
      <Form.Item {...commonProps} label="Warning">
        <Input
          placeholder="Warning Message"
          prefix={<span style={{ color: "#faad14" }}>⚠</span>}
        />
      </Form.Item>
      <Form.Item
        {...commonProps}
        label="Validating"
        help="Please wait while we validate your input"
      >
        <Input placeholder="Placeholder Text" />
      </Form.Item>
      <Form.Item {...commonProps} label="Success">
        <Input placeholder="Successful Input" />
      </Form.Item>
    </Space>
  );
};

export default InputStatesPreview;
