import { QuestionCircleOutlined } from '@ant-design/icons';
import { Divider, Form, Radio, Space, Tooltip, InputNumber } from 'antd';
import React, { FC, Fragment, useCallback, useState, useEffect } from 'react';
import { SectionSeparator, Show } from '@/components';
import { ColorPicker } from '@/components/colorPicker';
import { useTheme } from '@/providers';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { humanizeString } from '@/utils/string';
import { BACKGROUND_PRESET_COLORS, PRESET_COLORS, TEXT_PRESET_COLORS } from './presetColors';

interface IThemeConfig {
  name: string;
  onChange: (hex: string) => void;
  hint?: string;
}

const ThemeParameters: FC = () => {
  const { theme, changeTheme } = useTheme();

  console.log("THEME SPANS::",theme.componentSpan, theme.labelSpan);
  const [defaultLabelValue, setDefaultLabelValue] = useState<number>(theme?.labelSpan);
  const [defaultComponentValue, setDefaultComponentValue] = useState<number>(theme?.componentSpan);

  useEffect(()=>{
    setDefaultComponentValue(theme?.componentSpan);
    setDefaultLabelValue(theme?.labelSpan);
  },[theme]);

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
    changeTheme({
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
            presets={[{ label: "Presets", defaultOpen: true, colors: presetColors ?? PRESET_COLORS }]}
            value={initialColor}
            onChange={onChange}
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
    <Fragment>
      <SectionSeparator title="Theme" />

      <Space direction="vertical" align="start">
        {colorConfigs.map((config, index) =>
          renderColor(`theme_${index}`, config.name, theme?.application?.[config.name], (hex) => config.onChange(hex))
        )}

        <Divider />

        {/* Layout background Color */}
        {renderColor(
          'layoutBackground',
          'layoutBackground',
          theme?.layoutBackground,
          (hex) => changeTheme({ ...theme, layoutBackground: hex }),
          BACKGROUND_PRESET_COLORS
        )}
      </Space>

      <Divider />

      <SectionSeparator title="Text" />

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

      <Divider />

      <SectionSeparator title="Sidebar" />

      <Form>
        <Form.Item label="Theme">
          <Radio.Group
            name="sidebarTheme"
            value={theme?.sidebar}
            onChange={(e) => {
              changeTheme({
                ...theme,
                sidebar: e.target.value,
              });
            }}
          >
            <Radio value="dark">Dark</Radio>
            <Radio value="light">Light</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>

      <Divider />

      <SectionSeparator title="Form Layout Settings (Span)" />
      <Form>
        <Form.Item label="Label">
          <InputNumber placeholder="Label Span"
            defaultValue={defaultLabelValue}
            onChange={(value: number) => {
              changeTheme({
                ...theme,
                labelSpan: value,
              });
            }
            }
          />
        </Form.Item>
        <Form.Item label="Component">
          <InputNumber placeholder="Component Span"
            defaultValue={defaultComponentValue}
            onChange={(value: number) => {
              changeTheme({
                ...theme,
                componentSpan: value,
              });
            }
            }
          />
        </Form.Item>
      </Form>

    </Fragment>
  );
};

export default ThemeParameters;
