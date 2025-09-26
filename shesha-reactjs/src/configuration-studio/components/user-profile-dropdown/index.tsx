import React, { FC } from 'react';
import { Avatar, Divider, Dropdown, MenuProps, Space, theme } from 'antd';
import { LoginOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/providers';

const { useToken } = theme;

type MenuItems = MenuProps['items'];

export const UserProfileBlock: FC = () => {
  const { loginInfo, logoutUser } = useAuth();
  const { token } = useToken();

  const menuItems: MenuItems = [
    {
      key: 'logout',
      onClick: logoutUser,
      label: <><LoginOutlined /> Logout</>,
    },
  ];

  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: 'none',
  };

  const userFullName = loginInfo.fullName ?? "Unknown User";

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      popupRender={(menu) => (
        <div style={contentStyle}>
          <div style={{ padding: "10px" }}>
            <Space>
              <Avatar icon={<UserOutlined />} alt={userFullName} />
              <strong>{userFullName}</strong>
            </Space>
          </div>
          <Divider style={{ margin: 0 }} />
          {React.cloneElement(
            menu as React.ReactElement<{
              style: React.CSSProperties;
            }>,
            { style: menuStyle },
          )}
        </div>
      )}
    >
      <Avatar icon={<UserOutlined />} alt={userFullName} />
    </Dropdown>
  );
};
