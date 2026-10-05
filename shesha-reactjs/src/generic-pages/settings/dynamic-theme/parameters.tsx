import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Radio, Row, Slider, Space, Switch, Tooltip, Typography } from 'antd';
import { FC } from 'react';
import { ColorPicker } from '@/components/colorPicker';
import { ColorScheme, IConfigurableTheme, normalizeColorScheme } from '@/providers/theme/contexts';
import { ComponentDefaultsPanel } from './componentSettings/componentSettingsPanel';
import { GroupSettingsPanel } from './groupSettingsPanel';
import { useStyles } from './styles/styles';
import AlertsExample from './alertsPreview';
import InputStatesPreview from './inputStatePreview';
import TextsPreview from './textsPreview';
import { FormItemLayout } from 'antd/es/form/Form';
import { FormLabelAlign } from 'antd/es/form/interface';

/**
 * The theme settings tabs: theme-wide settings, the full per-component tree, then the four
 * component groups by style (see `StyleGroups`).
 */
export type ThemeSettingsSection = 'theme' | 'components' | 'input' | 'inline' | 'standard' | 'layout';

export interface ThemeParametersProps {
  value: IConfigurableTheme;
  onChange: (theme: IConfigurableTheme) => void;
  readOnly: boolean;
  section?: ThemeSettingsSection | undefined;
}

const PRESET_COLORS = [
  '#1890ff', '#ff4d4f', '#faad14', '#52c41a', '#13c2c2',
  '#722ed1', '#eb2f96', '#f5222d', '#fa8c16', '#a0d911',
];

interface ColorCircleProps {
  color: string | undefined;
  onChange: (color: string) => void;
  label: string;
  readOnly: boolean;
}

const ColorCircle: FC<ColorCircleProps> = ({ color, onChange, label, readOnly }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.colorCircleContainer}>
      <ColorPicker
        value={color}
        onChange={(newValue) => {
          if (typeof (newValue) === "string")
            onChange(newValue);
        }}
        readOnly={readOnly}
        allowClear
        presets={[{ label: 'Presets', defaultOpen: true, colors: PRESET_COLORS }]}
        className={styles.colorCircle}
      />
      <Typography.Text style={{ fontSize: 12 }}>{label}</Typography.Text>
    </div>
  );
};

/** Update empty properties to undefined. This is necessary for base theme values bucause there is no way to reset them */
export const setUndefinedForEmptyProperties = (data: Record<string, unknown | undefined>): Record<string, unknown | undefined> => {
  for (const key in data) {
    if (!data.hasOwnProperty(key)) continue;
    if (typeof data[key] === 'object')
      setUndefinedForEmptyProperties(data[key] as Record<string, unknown>);
    if (data[key] === '')
      data[key] = undefined;
  }
  return data;
};

/**
 * One tab of the theme settings. `onChange` is expected to be debounced by the caller, which owns a
 * single save for all tabs (see `ConfigurableThemeContent`) so edits made on different tabs in quick
 * succession can't overwrite each other.
 */
const ThemeParameters: FC<ThemeParametersProps> = ({ value: theme, onChange, readOnly, section = 'theme' }) => {
  const changeThemeInternal = (theme: IConfigurableTheme): void => {
    onChange(theme);
  };

  const updateTheme = <TSection extends 'application' | 'text'>(
    section: TSection,
    update: NonNullable<IConfigurableTheme[TSection]>,
  ): void => {
    changeThemeInternal({
      ...theme,
      [section]: { ...theme[section], ...update },
    });
  };

  const { styles } = useStyles();

  const labelSpan = theme.labelSpan ?? 6;
  const layout = theme.layout;

  const handleSpanChange = (val: number): void => {
    changeThemeInternal({
      ...theme,
      labelSpan: val,
      componentSpan: 24 - val,
    });
  };

  const primaryColor = theme.application?.primaryColor;
  const errorColor = theme.application?.errorColor;
  const warningColor = theme.application?.warningColor;
  const successColor = theme.application?.successColor;
  const infoColor = theme.application?.infoColor;

  return (
    <div style={{ padding: '0 0 0px' }}>
      {section === 'theme' && (
        <>
          <Card
            title={(
              <div>
                <h4 style={{ marginBottom: 4 }}>Theme</h4>
                <span style={{ color: '#999', fontSize: '12px' }}>
                  Select a theme to apply to your application.
                </span>
              </div>
            )}
          >
            <Radio.Group
              value={normalizeColorScheme(theme.sidebar)}
              onChange={(e) => {
                changeThemeInternal({
                  ...theme,
                  sidebar: e.target.value as ColorScheme,
                });
              }}
              disabled={readOnly}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="system">System</Radio.Button>
            </Radio.Group>

            <Row gutter={[32, 24]}>
              <Col xs={24} md={8}>
                <h4>Colours</h4>
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  Select a circle below to choose your desired colour.
                </Typography.Text>
                <Space size={16} wrap>
                  <ColorCircle color={primaryColor} onChange={(c) => updateTheme('application', { ...theme.application, primaryColor: c })} label="Primary" readOnly={readOnly} />
                  <ColorCircle color={errorColor} onChange={(c) => updateTheme('application', { ...theme.application, errorColor: c })} label="Error" readOnly={readOnly} />
                  <ColorCircle color={warningColor} onChange={(c) => updateTheme('application', { ...theme.application, warningColor: c })} label="Warning" readOnly={readOnly} />
                  <ColorCircle color={successColor} onChange={(c) => updateTheme('application', { ...theme.application, successColor: c })} label="Success" readOnly={readOnly} />
                  <ColorCircle color={infoColor} onChange={(c) => updateTheme('application', { ...theme.application, infoColor: c })} label="Info" readOnly={readOnly} />
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <h4>Text Colours</h4>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                  Select a circle below to choose your desired colour.
                </Typography.Text>
                <Space size={16} wrap>
                  <ColorCircle color={theme.text?.default} onChange={(c) => updateTheme('text', { ...theme.text, default: c })} label="Default" readOnly={readOnly} />
                  <ColorCircle color={theme.text?.secondary} onChange={(c) => updateTheme('text', { ...theme.text, secondary: c })} label="Secondary" readOnly={readOnly} />
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <h4>Component and Page</h4>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
                  Select a circle below to choose your desired colour.
                </Typography.Text>
                <Space size={16} wrap>
                  <ColorCircle color={theme.layoutBackground} onChange={(c) => changeThemeInternal({ ...theme, layoutBackground: c })} label="Page" readOnly={readOnly} />
                </Space>
              </Col>
            </Row>
          </Card>
          {/* Preview Card */}
          <Card
            title={(
              <div>
                <h4 style={{ marginBottom: 4 }}>Preview Card</h4>
                <span style={{ color: '#999', fontSize: '12px' }}>
                  Preview the default appearance for theme settings.
                </span>
              </div>
            )}
          >
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
                  <Button type="primary" block style={{ background: primaryColor, borderColor: primaryColor }}>Primary</Button>
                  <Button danger block>Error</Button>
                  <Button block style={{ color: successColor, borderColor: successColor }}>Secondary</Button>
                  <Button block>Default</Button>
                  <TextsPreview />
                </Space>
              </Col>
            </Row>
          </Card>
        </>
      )}
      {section === 'components' && (
        <>
          {/* Component Defaults Section: the full component tree, unfiltered */}
          <ComponentDefaultsPanel value={theme} onChange={changeThemeInternal} readOnly={readOnly} />
        </>
      )}
      {section === 'input' && (
        <>
          {/* Form Span Settings: label layout/spacing only affects input (form-item) components */}
          <div style={{ marginBottom: 24 }}>
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
              onChange={(e) => changeThemeInternal({ ...theme, layout: e.target.value as FormItemLayout })}
              disabled={readOnly}
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
                  disabled={readOnly}
                  tooltip={{ formatter: (v) => `Label: ${v}, Control: ${24 - (v ?? 0)}` }}
                  className={styles.slider}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Typography.Text>Label Align</Typography.Text>
                </div>
                <Radio.Group
                  value={theme.labelAlign}
                  onChange={(e) => changeThemeInternal({ ...theme, labelAlign: e.target.value as FormLabelAlign })}
                  disabled={readOnly}
                  optionType="button"
                  buttonStyle="solid"
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="left">Left</Radio.Button>
                  <Radio.Button value="right">Right</Radio.Button>
                </Radio.Group>
              </div>
            )}

            {/* Same value as Form Settings > Appearance > Colon; a form's own setting takes precedence. */}
            <Space align="center" style={{ display: 'flex' }}>
              <Switch
                id="theme-colon"
                size="small"
                checked={theme.colon ?? true}
                onChange={(checked) => changeThemeInternal({ ...theme, colon: checked })}
                disabled={readOnly}
              />
              <label htmlFor="theme-colon">Colon</label>
              <Tooltip title="Whether a colon is displayed after labels (only effective when layout is horizontal). Used by forms that don't set their own Colon in Form Settings.">
                <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
              </Tooltip>
            </Space>
          </div>

          {/* Group Defaults: one shared appearance form for every input component */}
          <GroupSettingsPanel group={section} value={theme} onChange={changeThemeInternal} readOnly={readOnly} />
        </>
      )}
      {(section === 'inline' || section === 'standard' || section === 'layout') && (
        <>
          {/* Group Defaults: one shared appearance form for every component in this style group */}
          <GroupSettingsPanel group={section} value={theme} onChange={changeThemeInternal} readOnly={readOnly} />
        </>
      )}
    </div>
  );
};

export default ThemeParameters;
