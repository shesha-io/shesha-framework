import React, { FC, useCallback } from 'react';
import { Alert, Col, Divider, Form, Radio, Row, Space } from 'antd';
import { CollapsiblePanel, Page, SectionSeparator } from '../../../components';
import { useTheme } from '../../..';
import ColorPicker from '../../../components/colorPicker';
import { humanizeString } from '../../../utils/string';
import FormExample from './form';

export interface IConfigurableThemePageProps {}

const ConfigurableThemePage: FC<IConfigurableThemePageProps> = () => {
  const { theme, changeTheme } = useTheme();

  const onColorChange = (nextColor: Partial<typeof theme>) => {
    changeTheme({
      ...theme,
      application: {
        ...theme?.application,
        ...nextColor,
      },
    });
  };

  const renderColor = useCallback(
    (colorName: 'primaryColor' | 'errorColor' | 'warningColor' | 'successColor' | 'infoColor') => {
      const initialColor = theme?.application && theme?.application[colorName];

      //console.log('LOGS:: renderColor theme: ', initialColor, colorName);

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <ColorPicker
            title={humanizeString(colorName)}
            presetColors={['#1890ff', '#25b864', '#ff6f00', '#ff4d4f', '#faad14', '#52c41a', '#1890ff']}
            // @ts-ignore
            color={{ hex: initialColor }}
            onChange={({ hex }) => {
              onColorChange({
                [colorName]: hex,
              });
            }}
          />

          <span>{humanizeString(colorName)}</span>
        </div>
      );
    },
    [theme]
  );

  return (
    <Page title="Customize theme">
      <Row gutter={16} wrap={false}>
        <Col flex="auto">
          <CollapsiblePanel collapsible="disabled" header="Configurations">
            <SectionSeparator title="Theme Colors" />

            <Alert message="Select the the colors below and see the changes on the next section" showIcon />

            <Divider />

            <Space direction="horizontal" align="start">
              {/* Primary Color */}
              {renderColor('primaryColor')}

              {/* Error Color */}
              {renderColor('errorColor')}

              {/* Warning Color */}
              {renderColor('warningColor')}

              {/* Success Color */}
              {renderColor('successColor')}

              {/* Info Color */}
              {renderColor('infoColor')}
            </Space>

            <Divider />

            <Form>
              <Form.Item label="Sidebar theme">
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
            </Form>

            <Divider />

            <SectionSeparator title="Results" />

            <Alert message="Below are the changes to based on the theme colors you selected" showIcon type="warning" />

            <Divider />

            <FormExample />
          </CollapsiblePanel>
        </Col>
      </Row>
    </Page>
  );
};

export default ConfigurableThemePage;
