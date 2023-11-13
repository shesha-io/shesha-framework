import React, { FC, Fragment, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { Avatar, Dropdown, Input, MenuProps, Space } from 'antd';
import { DownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../providers/auth';
import ShaLink from '../shaLink';
import { ProtectedContent, AppEditModeToggler, ConfigurableLogo } from '../';
import { PERM_APP_CONFIGURATOR } from '../../shesha-constants';
import { useSidebarMenu } from '../../providers';
import ConfigurationItemViewModeToggler from '../appConfigurator/configurationItemViewModeToggler';

const { Search } = Input;
type MenuItem = MenuProps['items'][number];

interface ILayoutHeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  collapsed?: boolean;
  customComponent?: ReactNode;
  imgSrc?: string;
}

const LayoutHeader: FC<ILayoutHeaderProps> = ({ collapsed, onSearch, customComponent, imgSrc }) => {
  const { loginInfo, logoutUser } = useAuth();
  const sidebar = useSidebarMenu(false);
  const { accountDropdownListItems, actions } = sidebar || {};

  const accountMenuItems = useMemo<MenuItem[]>(() => {
    const result = (accountDropdownListItems ?? []).map<MenuItem>(({ icon, text, url: link, onClick }, index) => (
      {
        key: index,
        onClick: onClick,
        label: link ? (
          <ShaLink icon={icon} linkTo={link}>
            {text}
          </ShaLink>
        ) : (
          <Fragment>
            {icon} {text}
          </Fragment>
        )
      }
    ));
    if (result.length > 0)
      result.push({ key: 'divider', type: 'divider' });

    result.push({ 
      key: 'logout', 
      onClick: logoutUser,
      label: (<>{<LoginOutlined />} Logout</>)
    });

    return result;
  }, [accountDropdownListItems]);

  return (
    <div className={classNames('layout-header', { collapsed })}>
      <div className="layout-header-left">
        <ConfigurableLogo imgSrc={imgSrc} />

        {onSearch && (
          <div className="search">
            <Search placeholder="input search text" onSearch={onSearch} style={{ width: 300 }} />
          </div>
        )}
      </div>

      <div className="layout-header-right">
        <div className="custom-components">{customComponent}</div>

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
          <span className="separator" />
          <Dropdown
            menu={{ items: accountMenuItems }}
            trigger={['click']}
          >
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              {loginInfo?.fullName} <DownOutlined />
            </a>
          </Dropdown>

          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    </div>
  );
};

export default LayoutHeader;
