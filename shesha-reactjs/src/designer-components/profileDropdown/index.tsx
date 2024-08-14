import { DownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps } from 'antd';
import React, { Fragment, useMemo } from 'react';
import { IToolboxComponent, ShaLink, useAuth, useSidebarMenu } from '@/index';
import { useStyles } from './styles';

type MenuItem = MenuProps['items'][number];

const ProfileDropdown: IToolboxComponent = {
  type: 'profileDropdown',
  isInput: false,
  canBeJsSetting: false,
  name: 'Profile Dropdown',
  icon: <UserOutlined />,
  Factory: () => {
    const { styles } = useStyles();
    const { loginInfo, logoutUser } = useAuth();
    const sidebar = useSidebarMenu(false);
    const { accountDropdownListItems } = sidebar || {};

    const accountMenuItems = useMemo<MenuItem[]>(() => {
      const result = (accountDropdownListItems ?? []).map<MenuItem>(({ icon, text, url: link, onClick }, index) => ({
        key: index,
        onClick: onClick,
        label: link ? (
          <ShaLink icon={icon} linkTo={link}>
            {text}
          </ShaLink>
        ) : (
          <Fragment>{icon}</Fragment>
        ),
      }));

      if (result.length > 0) result.push({ key: 'divider', type: 'divider' });

      result.push({
        key: 'logout',
        onClick: logoutUser,
        label: <>{<LoginOutlined />} Logout</>,
      });

      return result;
    }, [accountDropdownListItems, logoutUser]);

    return (
      <div className={styles.shaProfileDropdown}>
        <Dropdown menu={{ items: accountMenuItems }} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {loginInfo?.fullName} <DownOutlined />
          </a>
        </Dropdown>
        <Avatar icon={<UserOutlined />} />
      </div>
    );
  },
};

export default ProfileDropdown;
