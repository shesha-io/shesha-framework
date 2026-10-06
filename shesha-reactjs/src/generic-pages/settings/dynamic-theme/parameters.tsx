import { Button, Card, Col, Radio, Row, Space, Typography } from 'antd';
import { FC } from 'react';
import { ColorPicker } from '@/components/colorPicker';
import { ColorScheme, IConfigurableTheme, normalizeColorScheme } from '@/providers/theme/contexts';
import { ComponentDefaultsPanel } from './componentSettings/componentSettingsPanel';
import { GroupSettingsPanel } from './groupSettingsPanel';
import { CardTitle } from './cardTitle';
import { FormLayoutSettingsPanel } from './formLayoutSettingsPanel';
import { useStyles } from './styles/styles';
import AlertsExample from './alertsPreview';
import InputStatesPreview from './inputStatePreview';
import TextsPreview from './textsPreview';

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
      <Typography.Text className={styles.colorCircleLabel}>{label}</Typography.Text>
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


  const primaryColor = theme.application?.primaryColor;
  const errorColor = theme.application?.errorColor;
  const warningColor = theme.application?.warningColor;
  const successColor = theme.application?.successColor;
  const infoColor = theme.application?.infoColor;

  return (
    <div>
      {section === 'theme' && (
        <>
          <Card
            title={<CardTitle title="Theme" description="Select a theme to apply to your application." />}
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
                <Typography.Text type="secondary" className={styles.sectionHint}>
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
                <Typography.Text type="secondary" className={styles.sectionHint}>
                  Select a circle below to choose your desired colour.
                </Typography.Text>
                <Space size={16} wrap>
                  <ColorCircle color={theme.text?.default} onChange={(c) => updateTheme('text', { ...theme.text, default: c })} label="Default" readOnly={readOnly} />
                  <ColorCircle color={theme.text?.secondary} onChange={(c) => updateTheme('text', { ...theme.text, secondary: c })} label="Secondary" readOnly={readOnly} />
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <h4>Component and Page</h4>
                <Typography.Text type="secondary" className={styles.sectionHint}>
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
            title={<CardTitle title="Preview Card" description="Preview the default appearance for theme settings." />}
          >
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Typography.Text strong className={styles.sectionLabel}>Alerts</Typography.Text>
                <AlertsExample />
              </Col>

              <Col xs={24} md={8}>
                <Typography.Text strong className={styles.sectionLabel}>Forms</Typography.Text>
                <InputStatesPreview />
              </Col>

              <Col xs={24} md={8}>
                <Typography.Text strong className={styles.sectionLabel}>Buttons</Typography.Text>
                <Space orientation="vertical" className={styles.space} size="small">
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
          <Card
            title={(
              <CardTitle
                title="Form Span settings"
                description="The layout uses a 24-column grid system by default. Choose between vertical or horizontal layout. You can customize how much space each element takes by setting the label span and wrapper span."
              />
            )}
          >
            <FormLayoutSettingsPanel value={theme} onChange={changeThemeInternal} readOnly={readOnly} />
          </Card>
          <GroupSettingsPanel group={section} value={theme} onChange={changeThemeInternal} readOnly={readOnly} />
        </>
      )}
      {(section === 'inline' || section === 'standard' || section === 'layout') && (
        <>
          <GroupSettingsPanel group={section} value={theme} onChange={changeThemeInternal} readOnly={readOnly} />
        </>
      )}
    </div>
  );
};

export default ThemeParameters;
