import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Form, Input, Radio, Row, Slider, Space, Tooltip, Typography } from 'antd';
import React, { FC } from 'react';
import { ColorPicker } from '@/components/colorPicker';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { ComponentDefaultsPanel } from './componentDefaultsPanel';
import { useStyles } from './styles/styles';

export interface ThemeParametersProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
  themeLevel?: number;
}

const PRESET_COLORS = [
  '#1890ff', '#ff4d4f', '#faad14', '#52c41a', '#13c2c2',
  '#722ed1', '#eb2f96', '#f5222d', '#fa8c16', '#a0d911',
];

interface ColorCircleProps {
  color?: string;
  onChange: (color: string) => void;
  label: string;
  readonly?: boolean;
}

const ColorCircle: FC<ColorCircleProps> = ({ color, onChange, label, readonly }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.colorCircleContainer}>
      <ColorPicker
        value={color}
        onChange={onChange}
        readOnly={readonly}
        allowClear
        presets={[{ label: 'Presets', defaultOpen: true, colors: PRESET_COLORS }]}
        className={styles.colorCircle}
      />
      <Typography.Text style={{ fontSize: 12 }}>{label}</Typography.Text>
    </div>
  );
};

const ThemeParameters: FC<ThemeParametersProps> = ({ value: theme, onChange, readonly, themeLevel }) => {
  const updateTheme = (update: Partial<IConfigurableTheme>): void => {
    onChange?.({ ...theme, ...update });
  };

  const { styles } = useStyles();

  const labelSpan =  theme?.labelSpan ?? 6;
  const layout = theme?.labelAlign === 'top' ? 'vertical' : 'horizontal';

  const handleLayoutChange = (val: 'vertical' | 'horizontal'): void => {
    if (val === 'vertical') {
      onChange?.({
        ...theme,
          labelAlign: 'top',
      });
    } else {
      onChange?.({
        ...theme,
          labelAlign: 'left',
      });
    }
  };

  const handleSpanChange = (val: number): void => {
    onChange?.({
      ...theme,
        labelSpan: val,
        componentSpan: 24 - val,
      });
  };

  const primaryColor = theme?.application?.primaryColor;
  const errorColor = theme?.application?.errorColor;
  const warningColor = theme?.application?.warningColor;
  const successColor = theme?.application?.successColor;
  const infoColor = theme?.application?.infoColor;

  return (
    <div style={{ padding: '0 0 24px' }}>
      {themeLevel === 1 && (
        <>
          <Typography.Title level={4} style={{ marginBottom: 4 }}>Theme Settings</Typography.Title>
          <Typography.Text type="secondary">
            Customize the look and feel of your workspace.
          </Typography.Text>

          <Typography.Title level={5} style={{ marginBottom: 12 }}>Theme</Typography.Title>
          <Radio.Group
            value={theme?.sidebar || 'light'}
            onChange={(e) => updateTheme({ sidebar: e.target.value })}
            disabled={readonly}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="light">Light</Radio.Button>
            <Radio.Button value="dark">Dark</Radio.Button>
            <Radio.Button value="system">System</Radio.Button>
          </Radio.Group>

          <Row gutter={[32, 24]} style={{ marginTop: 32 }}>
            <Col xs={24} md={8}>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>Colours</Typography.Title>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                Select a circle below to choose your desired colour.
              </Typography.Text>
              <Space size={16} wrap>
                <ColorCircle color={primaryColor} onChange={(c) => updateTheme({ application: { ...theme?.application, primaryColor: c } })} label="Primary" readonly={readonly} />
                <ColorCircle color={errorColor} onChange={(c) => updateTheme({ application: { ...theme?.application, errorColor: c } })} label="Error" readonly={readonly} />
                <ColorCircle color={warningColor} onChange={(c) => updateTheme({ application: { ...theme?.application, warningColor: c } })} label="Warning" readonly={readonly} />
                <ColorCircle color={successColor} onChange={(c) => updateTheme({ application: { ...theme?.application, successColor: c } })} label="Success" readonly={readonly} />
                <ColorCircle color={infoColor} onChange={(c) => updateTheme({ application: { ...theme?.application, infoColor: c } })} label="Info" readonly={readonly} />
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>Text Colours</Typography.Title>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                Select a circle below to choose your desired colour.
              </Typography.Text>
              <Space size={16} wrap>
                <ColorCircle color={theme?.text?.default} onChange={(c) => updateTheme({ text: { ...theme?.text, default: c } })} label="Default" readonly={readonly} />
                <ColorCircle color={theme?.text?.secondary} onChange={(c) => updateTheme({ text: { ...theme?.text, secondary: c } })} label="Secondary" readonly={readonly} />
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>Component And Page</Typography.Title>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                Select a circle below to choose your desired colour.
              </Typography.Text>
              <Space size={16} wrap>
                <ColorCircle color={ theme?.layoutBackground} onChange={(c) => updateTheme({ layoutBackground: c })} label="Page" readonly={readonly} />
              </Space>
            </Col>
          </Row>

          {/* Form Span Settings */}
          <div style={{ marginTop: 32 }}>
            <Space align="center" style={{ marginBottom: 4 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>Form Span Settings</Typography.Title>
              <Tooltip title="The layout uses a 24-column grid system by default. Choose between vertical or horizontal layout. You can customize how much space each element takes by setting the label span and wrapper span.">
                <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
              </Tooltip>
            </Space>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
              The layout uses a 24-column grid system by default. Choose between vertical or horizontal layout. You can customize how much space each element takes by setting the label span and wrapper span.
            </Typography.Text>

            <Radio.Group
              value={layout}
              onChange={(e) => handleLayoutChange(e.target.value)}
              disabled={readonly}
              optionType="button"
              buttonStyle="solid"
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value="vertical">Vertical</Radio.Button>
              <Radio.Button value="horizontal">Horizontal</Radio.Button>
            </Radio.Group>

            {layout === 'horizontal' && (
              <div style={{ maxWidth: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Typography.Text>0</Typography.Text>
                  <Typography.Text style={{ transform: `translateX(${(labelSpan / 24) * 100}%)` }}>{labelSpan}</Typography.Text>
                  <Typography.Text>24</Typography.Text>
                </div>
                <Slider
                  min={0}
                  max={24}
                  value={labelSpan}
                  onChange={handleSpanChange}
                  disabled={readonly}
                  tooltip={{ formatter: (v) => `Label: ${v}, Control: ${24 - (v ?? 0)}` }}
                  className={styles.slider}
                />
              </div>
            )}
          </div>

          {/* Preview Card */}
          <div style={{ marginTop: 32 }}>
            <Typography.Title level={5} style={{ marginBottom: 12 }}>Preview Card</Typography.Title>
            <Card style={{ background: theme?.layoutBackground ?? '#f0f2f5' }}>
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>Alerts</Typography.Text>
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <Alert title="Success Alert" type="success" showIcon style={{ height: 32, padding: '4px 8px', alignItems: 'center', display: 'flex' }} />
                    <Alert title="Info Alert" type="info" showIcon style={{ height: 32, padding: '4px 8px', alignItems: 'center', display: 'flex' }} />
                    <Alert title="Warning Alert" type="warning" showIcon style={{ height: 32, padding: '4px 8px', alignItems: 'center', display: 'flex' }} />
                    <Alert title="Error Alert" type="error" showIcon style={{ height: 32, padding: '4px 8px', alignItems: 'center', display: 'flex' }} />
                  </Space>
                </Col>

                <Col xs={24} md={8}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>Forms</Typography.Text>
                  <Form.Item label="Failed" validateStatus="error" help="Please complete before submission">
                    <Input placeholder="Placeholder Text" />
                  </Form.Item>
                  <Form.Item label="Warning">
                    <Input placeholder="Warning Message" prefix={<span style={{ color: '#faad14' }}>⚠</span>} />
                  </Form.Item>
                  <Form.Item label="Validating" help="Please wait while we validate your input">
                    <Input placeholder="Placeholder Text" />
                  </Form.Item>
                  <Form.Item label="Success">
                    <Input placeholder="Successful Input" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>Buttons</Typography.Text>
                  <Space orientation="vertical" style={{ width: '100%' }} size="small">
                    <Button type="primary" style={{ background: primaryColor, borderColor: primaryColor, width: '100%' }}>Primary</Button>
                    <Button danger style={{ width: '100%' }}>Error</Button>
                    <Button style={{ width: '100%', color: successColor ?? '#52c41a', borderColor: successColor ?? '#52c41a' }}>Secondary</Button>
                    <Button style={{ width: '100%' }}>Default</Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </>
      )}
      {themeLevel === 2 && (
        <>
          {/* Component Defaults Section */}
          <div style={{ marginTop: 48 }}>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>Component Settings</Typography.Title>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              Configure default appearance styles for individual components. Select a component from the tree to customize its appearance settings.
            </Typography.Text>
            <ComponentDefaultsPanel value={theme} onChange={onChange} readonly={readonly} />
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeParameters;