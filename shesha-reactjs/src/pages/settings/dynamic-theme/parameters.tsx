import { Divider, Form, Radio, Space } from 'antd';
import { Theme } from 'antd/lib/config-provider/context';
import React, { FC, Fragment, useCallback } from 'react';
import { ColorResult } from 'react-color';
import { SectionSeparator } from '../../../components';
import ColorPicker from '../../../components/colorPicker';
import { useTheme } from '../../../providers';
import { humanizeString } from '../../../utils/string';

interface IConfigurableTheme {
  application?: Theme;
  sidebar?: 'dark' | 'light';
  sidebarBackground?: string;
  layoutBackground?: string;
}

const ThemeParameters: FC = () => {
  const { theme, changeTheme } = useTheme();

  const onColorChange = (nextColor: Partial<IConfigurableTheme['application']>) => {
    changeTheme({
      ...theme,
      application: {
        ...theme?.application,
        ...nextColor,
      },
    });
  };

  const renderColor = useCallback(
    (colorName: string, initialColor: string, onChange: (color: ColorResult) => void, presetColors?: string[]) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <ColorPicker
            title={humanizeString(colorName)}
            presetColors={presetColors ?? ['#1890ff', '#25b864', '#ff6f00', '#ff4d4f', '#faad14', '#52c41a', '#1890ff']}
            // @ts-ignore
            color={{ hex: initialColor }}
            onChange={onChange}
          />

          <span>{humanizeString(colorName)} </span>
        </div>
      );
    },
    [theme]
  );

  const colorConfigs = [
    { name: 'processingColor', onChange: (hex: string) => onColorChange({ processingColor: hex }) },
    { name: 'errorColor', onChange: (hex: string) => onColorChange({ errorColor: hex }) },
    { name: 'warningColor', onChange: (hex: string) => onColorChange({ warningColor: hex }) },
    { name: 'successColor', onChange: (hex: string) => onColorChange({ successColor: hex }) },
    { name: 'infoColor', onChange: (hex: string) => onColorChange({ infoColor: hex }) },
  ];

  return (
    <Fragment>
      <SectionSeparator title="Theme" />

      <Space direction="vertical" align="start">
        {colorConfigs.map(config =>
          renderColor(config.name, theme?.application?.[config.name], ({ hex }) => config.onChange(hex))
        )}

        <Divider />

        {/* Layout background Color */}
        {renderColor(
          'layoutBackground',
          theme?.layoutBackground,
          ({ hex }) => changeTheme({ ...theme, layoutBackground: hex }),
          [
            '#f0f2f5', // Default
            '#F0F0F0', // Light Gray
            '#FAFAFA', // Off White
            '#FFF9D9', // Pale Yellow
            '#FFF0F5', // Soft Pink
            '#E6E6FA', // Light Lavender
            '#E0FFFF', // Baby Blue
            '#E0F2F1', // Mint Green
            '#FFE4C4', // Pastel Peach
            '#B0E0E6', // Powder Blue
            '#F5F5DC', // Light Beige
          ]
        )}
      </Space>

      <Divider />

      <SectionSeparator title="Sidebar" />

      <Form>
        <Form.Item label="Theme">
          <Radio.Group
            name="sidebarTheme"
            value={theme?.sidebar}
            onChange={e => {
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

        <Form.Item label="Background">
          {renderColor('', theme?.sidebarBackground, ({ hex }) => changeTheme({ ...theme, sidebarBackground: hex }))}
        </Form.Item>
      </Form>

      <Divider />
    </Fragment>
  );
};

export default ThemeParameters;
