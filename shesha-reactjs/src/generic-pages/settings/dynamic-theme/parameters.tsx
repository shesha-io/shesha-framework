import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Form, Input, Radio, Row, Slider, Space, Tooltip, Typography } from 'antd';
import React, { FC } from 'react';
import { ColorPicker } from '@/components/colorPicker';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { ComponentDefaultsPanel } from './componentSettingsPanel';
import { useStyles } from './styles/styles';
import { ConfigurableForm } from '@/components';
import { nanoid } from '@/utils/uuid';
import AlertsExample from './alertsPreview';
import InputStatesPreview from './inputStatePreview';
import TextsPreview from './textsPreview';

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

  const changeThemeInternal = (theme: IConfigurableTheme): void => {
    if (onChange) onChange(theme);
  };

  const mergeThemeSection = (
    section: keyof IConfigurableTheme,
    update: Partial<IConfigurableTheme[keyof IConfigurableTheme]>,
  ): IConfigurableTheme => {
    return { ...(theme[section] as unknown as Record<string, unknown>), ...(update as Record<string, unknown>) };
  };

  const updateTheme = (
    section: keyof IConfigurableTheme,
    update: Partial<IConfigurableTheme[keyof IConfigurableTheme]>,
  ): void => {
    changeThemeInternal({
      ...theme,
      [section]: mergeThemeSection(section, update),
    });
  };

  const { styles } = useStyles();

  const labelSpan = theme?.labelSpan ?? 6;
  const layout = theme?.layout;

  const handleSpanChange = (val: number): void => {
    changeThemeInternal?.({
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
            onChange={(e) => {
              changeThemeInternal({
                ...theme,
                sidebar: e.target.value,
              })
            }}
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
                <ColorCircle color={primaryColor} onChange={(c) => updateTheme('application', { ...theme?.application, primaryColor: c })} label="Primary" readonly={readonly} />
                <ColorCircle color={errorColor} onChange={(c) => updateTheme('application', { ...theme?.application, errorColor: c })} label="Error" readonly={readonly} />
                <ColorCircle color={warningColor} onChange={(c) => updateTheme('application', { ...theme?.application, warningColor: c })} label="Warning" readonly={readonly} />
                <ColorCircle color={successColor} onChange={(c) => updateTheme('application', { ...theme?.application, successColor: c })} label="Success" readonly={readonly} />
                <ColorCircle color={infoColor} onChange={(c) => updateTheme('application', { ...theme?.application, infoColor: c })} label="Info" readonly={readonly} />
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>Text Colours</Typography.Title>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                Select a circle below to choose your desired colour.
              </Typography.Text>
              <Space size={16} wrap>
                <ColorCircle color={theme?.text?.default} onChange={(c) => updateTheme('text', { ...theme?.text, default: c })} label="Default" readonly={readonly} />
                <ColorCircle color={theme?.text?.secondary} onChange={(c) => updateTheme('text', { ...theme?.text, secondary: c })} label="Secondary" readonly={readonly} />
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>Component and Page</Typography.Title>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                Select a circle below to choose your desired colour.
              </Typography.Text>
              <Space size={16} wrap>
                <ColorCircle color={theme?.layoutBackground} onChange={(c) => changeThemeInternal({ ...theme, layoutBackground: c })} label="Page" readonly={readonly} />
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
              Configure how form labels and controls are positioned using a 24-column grid system.
            </Typography.Text>

            <Radio.Group
              value={layout}
              onChange={(e) => changeThemeInternal({ ...theme, layout: e.target.value })}
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
                  <Typography.Text>Label: {labelSpan}</Typography.Text>
                  <Typography.Text>Component: {24 - labelSpan}</Typography.Text>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Typography.Text>Label Align</Typography.Text>
                </div>
                <Radio.Group
                  value={theme.labelAlign}
                  onChange={(e) => changeThemeInternal({ ...theme, labelAlign: e.target.value })}
                  disabled={readonly}
                  optionType="button"
                  buttonStyle="solid"
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="left">Left</Radio.Button>
                  <Radio.Button value="right">Right</Radio.Button>
                </Radio.Group>
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
                  <AlertsExample />
                </Col>

                <Col xs={24} md={8}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>Forms</Typography.Text>
                  <InputStatesPreview />
                </Col>

                <Col xs={24} md={8}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>Buttons</Typography.Text>
                  <Space orientation="vertical" style={{ width: '100%' }} size="small">
                    <Button size='small' type="primary" block style={{ background: primaryColor, borderColor: primaryColor }}>Primary</Button>
                    <Button size='small' danger block>Error</Button>
                    <Button size='small' block style={{ color: successColor, borderColor: successColor }}>Secondary</Button>
                    <Button size='small' block>Default</Button>
                    <TextsPreview/>
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
