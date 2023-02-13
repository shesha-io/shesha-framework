import React, { FC, Fragment } from 'react';
import classNames from 'classnames';
import { Avatar, Dropdown, Input, Menu, Space } from 'antd';
import { nanoid } from 'nanoid/non-secure';
import { DownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth, useSidebarMenu } from '../../providers';
import ShaLink from '../shaLink';
import { ProtectedContent, AppEditModeToggler, ConfigurableLogo } from '..';
import { PERM_APP_CONFIGURATOR } from '../../constants';
import ConfigurationItemViewModeToggler from '../appConfigurator/configurationItemViewModeToggler';

const { Search } = Input;

interface ILayoutHeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  collapsed?: boolean;
}

const DefaultLayoutHeader: FC<ILayoutHeaderProps> = ({ collapsed, onSearch }) => {
  const { loginInfo, logoutUser } = useAuth();
  const sidebar = useSidebarMenu(false);
  const { accountDropdownListItems, actions } = sidebar || {};

  const menu = (
    <Menu>
      {accountDropdownListItems?.map(({ icon, text, url: link, onClick }) => (
        <Menu.Item key={nanoid()} onClick={onClick}>
          {link ? (
            <ShaLink icon={icon} linkTo={link}>
              {text}
            </ShaLink>
          ) : (
            <Fragment>
              {icon} {text}
            </Fragment>
          )}
        </Menu.Item>
      ))}

      {accountDropdownListItems?.length && <Menu.Divider />}

      <Menu.Item onClick={logoutUser}>{<LoginOutlined />} Logout</Menu.Item>
    </Menu>
  );

  return (
    <div className={classNames('layout-header', { collapsed })}>
      <div className="layout-header-left">
        <ConfigurableLogo />

        {onSearch && (
          <div className="search">
            <Search placeholder="input search text" onSearch={onSearch} style={{ width: 300 }} />
          </div>
        )}
      </div>

      <div className="layout-header-right">
        <div className="actions">
          {actions?.map(({ icon, url }) => (
            <span className="action-icon">
              <ShaLink linkTo={url} icon={icon} />
            </span>
          ))}
          <ProtectedContent permissionName={PERM_APP_CONFIGURATOR}>
            <Space>
              <ConfigurationItemViewModeToggler />
              <AppEditModeToggler />
            </Space>
          </ProtectedContent>
        </div>

        <div className="account">
          <Dropdown overlay={menu} trigger={['click']}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              {loginInfo?.fullName} <DownOutlined />
            </a>
          </Dropdown>

          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayoutHeader;
