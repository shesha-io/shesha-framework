import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Empty, MenuProps, Space, theme } from 'antd';
import React, { FC, useMemo } from 'react';
import { buildCreateNewMenu } from '@/configuration-studio/menu-utils';
import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';
import { useCsSubscription } from '@/configuration-studio/cs/hooks';

const { useToken } = theme;

type MenuItems = MenuProps["items"];

export const NewButton: FC = () => {
  const cs = useConfigurationStudio();
  const node = cs.treeSelectedNode;
  useCsSubscription('tree');

  const menuItems = useMemo<MenuItems>(() => {
    return buildCreateNewMenu({ configurationStudio: cs, node: node });
  }, [cs, node]);
  const { token } = useToken();
  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  return (
    <Dropdown
      menu={{ items: menuItems }}
      popupRender={(menu) => (
        menuItems.length > 0
          ? menu
          : (
            <div style={contentStyle}>
              <div style={{ padding: "10px" }}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select tree node" />
              </div>
            </div>
          )
      )}
    >
      <Button>
        <Space>
          New
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
