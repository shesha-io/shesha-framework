import { Avatar, Dropdown, MenuProps } from 'antd';
import React, { Fragment, useMemo } from 'react';
import {
  IButtonGroup,
  IButtonItem,
  IConfigurableActionConfiguration,
  IConfigurableFormComponent,
  IconType,
  IToolboxComponent,
  ShaIcon,
  ShaLink,
  useAuth,
  useForm,
  useFormExpression,
  useGlobalState,
  useSidebarMenu,
} from '@/index';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { ItemType } from 'antd/es/menu/interface';

interface IProfileDropdown extends IConfigurableFormComponent {
  items?: IButtonGroup[];
  subText?: string;
  subTextColor?: string;
  subTextFontSize?: string;
  subTextStyle?: string;
}

type MenuItem = MenuProps['items'][number];

const ProfileDropdown: IToolboxComponent<IProfileDropdown> = {
  type: 'profileDropdown',
  name: 'Profile Dropdown',
  isInput: false,
  canBeJsSetting: false,
  icon: <UserOutlined />,
  Factory: ({ model }) => {
    const { subText, subTextColor, subTextFontSize, subTextStyle } = model;

    const { styles } = useStyles({
      subText,
    });
    const { loginInfo, logoutUser } = useAuth();
    const { formData } = useForm();
    const { globalState } = useGlobalState();
    const { executeAction } = useFormExpression();

    const sidebar = useSidebarMenu(false);
    const { accountDropdownListItems } = sidebar || {};

    const subTextStyling = {
      color: subTextColor,
      fontSize: subTextFontSize,
      ...getStyle(subTextStyle, formData, globalState),
    };

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

    const getMenuItem = (
      items: IButtonGroup[] = [],
      execute: (payload: IConfigurableActionConfiguration) => void
    ): ItemType[] =>
      items.map(({ childItems, id, icon, label, ...payload }) => ({
        key: id,
        label: (
          <Fragment>
            {icon && <ShaIcon iconName={icon as IconType} />} {label}
          </Fragment>
        ),
        children: childItems ? getMenuItem(childItems, execute) : undefined,
        onClick: () => execute((payload as IButtonItem)?.actionConfiguration),
      }));

    const menuItems = getMenuItem(model.items, executeAction);

    if (model.hidden) return null;

    return (
      <div className={styles.shaProfileDropdownWrapper}>
        {subText && <div style={subTextStyling}>{subText}</div>}

        <div className={styles.shaProfileDropdown}>
          <Dropdown menu={{ items: [...menuItems, ...accountMenuItems] }} trigger={['click']}>
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              {loginInfo?.fullName} <DownOutlined />
            </a>
          </Dropdown>
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default ProfileDropdown;
