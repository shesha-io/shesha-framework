import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Radio, Space, Tooltip, InputNumber } from 'antd';
import React, { FC, useCallback } from 'react';
import { SectionSeparator, Show } from '@/components';
import { ColorPicker } from '@/components/colorPicker';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { humanizeString } from '@/utils/string';
import { BACKGROUND_PRESET_COLORS, PRESET_COLORS, TEXT_PRESET_COLORS } from './presetColors';
import { formItemLayout } from './form';

interface IThemeConfig {
  name: string;
  onChange: (hex: string) => void;
  hint?: string;
}

export interface ThemeParametersProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

const ThemeParameters: FC<ThemeParametersProps> = ({ value: theme, onChange, readonly }) => {
  //const { theme, changeTheme } = useTheme();

  const changeThemeInternal = (theme: IConfigurableTheme) => {
    if (onChange) onChange(theme);
  };

  const mergeThemeSection = (
    section: keyof IConfigurableTheme,
    update: Partial<IConfigurableTheme[keyof IConfigurableTheme]>
  ) => {
    return { ...(theme[section] as unknown as Record<string, unknown>), ...(update as Record<string, unknown>) };
  };

  const updateTheme = (
    section: keyof IConfigurableTheme,
    update: Partial<IConfigurableTheme[keyof IConfigurableTheme]>
  ) => {
    changeThemeInternal({
      ...theme,
      [section]: mergeThemeSection(section, update),
    });
  };

  const renderColor = useCallback(
    (
      key: string,
      colorName: string,
      initialColor: string,
      onChange: (color: string) => void,
      presetColors?: string[],
      hint?: string
    ) => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Space>
          <ColorPicker
            title={humanizeString(colorName)}
            presets={[{ label: 'Presets', defaultOpen: true, colors: presetColors ?? PRESET_COLORS }]}
            value={initialColor}
            onChange={onChange}
            readOnly={readonly}
          />
          <span>{humanizeString(colorName)} </span>
          <Show when={Boolean(hint)}>
            <Tooltip title={hint}>
              <span className="sha-color-tooltip" style={{ cursor: 'pointer' }}>
                <QuestionCircleOutlined />
              </span>
            </Tooltip>
          </Show>
        </Space>
      </div>
    ),
    [theme]
  );

  const colorConfigs: IThemeConfig[] = [
    { name: 'primaryColor', onChange: (hex: string) => updateTheme('application', { primaryColor: hex }) },
    { name: 'errorColor', onChange: (hex: string) => updateTheme('application', { errorColor: hex }) },
    { name: 'warningColor', onChange: (hex: string) => updateTheme('application', { warningColor: hex }) },
    { name: 'successColor', onChange: (hex: string) => updateTheme('application', { successColor: hex }) },
    { name: 'infoColor', onChange: (hex: string) => updateTheme('application', { infoColor: hex }) },
  ];

  const textConfigs: IThemeConfig[] = [
    { name: 'default', onChange: (hex: string) => updateTheme('text', { default: hex }) },
    { name: 'secondary', onChange: (hex: string) => updateTheme('text', { secondary: hex }) },
  ];

  return (
    <div style={{ marginTop: '10px' }}>
      <SectionSeparator title="Theme" />

      <Space direction="vertical" align="start" size={24}>
        <Space direction="vertical" align="start">
          {colorConfigs.map((config, index) =>
            renderColor(`theme_${index}`, config.name, theme?.application?.[config.name], (hex) => config.onChange(hex))
          )}
        </Space>
        
        {/* Layout background Color */}
        {renderColor(
          'layoutBackground',
          'layoutBackground',
          theme?.layoutBackground,
          (hex) => changeThemeInternal({ ...theme, layoutBackground: hex }),
          BACKGROUND_PRESET_COLORS
        )}
      </Space>

      <SectionSeparator title="Text" containerStyle={{ marginTop: '8px' }} />

      <Space direction="vertical" align="start">
        {textConfigs.map((config, index) =>
          renderColor(
            `text_${index}`,
            config.name,
            theme?.text?.[config.name],
            (hex) => config.onChange(hex),
            TEXT_PRESET_COLORS,
            config?.hint
          )
        )}
      </Space>

      <SectionSeparator title="Sidebar" containerStyle={{ marginTop: '8px' }} />

      <Form>
        <Form.Item label="Theme">
          <Radio.Group
            name="sidebarTheme"
            value={theme?.sidebar}
            onChange={(e) => {
              changeThemeInternal({
                ...theme,
                sidebar: e.target.value,
              });
            }}
            disabled={readonly}
          >
            <Radio value="dark">Dark</Radio>
            <Radio value="light">Light</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>

      <SectionSeparator title="Form Span Settings" containerStyle={{ marginTop: '8px' }} />
      <Form
        {...formItemLayout}
        labelWrap={true}
        layout="horizontal"
        labelAlign="right"
        labelCol={{ span: 14 }}
        wrapperCol={{ span: 10 }}
        fields={[
          {
            name: ['label'],
            value: theme?.labelSpan,
          },
          {
            name: ['component'],
            value: theme?.componentSpan,
          },
        ]}
      >
        <Form.Item label="Label" name={'label'}>
          <InputNumber
            placeholder="Label Span"
            style={{ width: '100%' }}
            onChange={(value: number) => {
              changeThemeInternal({
                ...theme,
                labelSpan: value,
              });
            }}
            readOnly={readonly}
          />
        </Form.Item>

        <Form.Item label="Component" name={'component'}>
          <InputNumber
            placeholder="Component Span"
            style={{ width: '100%' }}
            onChange={(value: number) => {
              changeThemeInternal({
                ...theme,
                componentSpan: value,
              });
            }}
            readOnly={readonly}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default ThemeParameters;
