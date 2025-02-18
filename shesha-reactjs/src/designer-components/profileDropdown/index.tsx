import {
  ConfigurableForm,
  FormIdentifier,
  IButtonGroup,
  IConfigurableFormComponent,
  IToolboxComponent,
  useAuth,
  useForm,
  useFormExpression,
  useGlobalState,
  useSidebarMenu,
} from '@/index';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Popover } from 'antd';
import React, { useMemo, useState } from 'react';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { getAccountMenuItems, getMenuItem } from './utils';
import {
  getDynamicActionsItemsLevel,
  getItemsWithResolved,
  IDynamicItemsEvaluationStore,
  IResolvedDynamicItem,
} from '@/providers/dynamicActions/evaluator/utils';
import { SingleDynamicItemEvaluator } from '@/providers/dynamicActions/evaluator/singleDynamicItemEvaluator';

interface IProfileDropdown extends IConfigurableFormComponent {
  items?: IButtonGroup[];
  subText?: string;
  subTextColor?: string;
  subTextFontSize?: string;
  subTextStyle?: string;
  showUserInfo?: boolean;
  popOverTitle?: string;
  popOverFormId?: FormIdentifier;
  popOverContentStyle?: string;
}

const ProfileDropdown: IToolboxComponent<IProfileDropdown> = {
  type: 'profileDropdown',
  name: 'Profile Dropdown',
  isInput: false,
  canBeJsSetting: false,
  icon: <UserOutlined />,
  Factory: ({ model }) => {
    const [numResolved, setNumResolved] = useState(0);

    const {
      subText,
      subTextColor,
      subTextFontSize,
      subTextStyle,
      showUserInfo,
      popOverTitle,
      popOverFormId,
      popOverContentStyle,
    } = model;

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

    const evaluation = useMemo<IDynamicItemsEvaluationStore>(() => {
      const dynamicItems: IResolvedDynamicItem[] = [];
      const preparedItems = getDynamicActionsItemsLevel(model.items ?? [], (dynamicItem) => {
        dynamicItems.push(dynamicItem);
      });
      return {
        dynamicItems,
        items: preparedItems,
      };
    }, [model.items]);

    const finalItems = useMemo(() => {
      return getItemsWithResolved(evaluation.items);
    }, [evaluation.items, numResolved]);

    const menuItems = getMenuItem(finalItems, executeAction);

    const accountMenuItems = getAccountMenuItems(accountDropdownListItems, logoutUser);

    const onDynamicItemEvaluated = () => {
      setNumResolved((prev) => prev + 1);
    };

    if (model.hidden) return null;

    const popoverContent = popOverFormId ? (
      <div style={getStyle(popOverContentStyle, formData, globalState)} ><ConfigurableForm formId={popOverFormId} mode="readonly" /></div>
    ) : (
      <div>Select Popover Form</div>
    );

    const renderDropdown = () =>
      showUserInfo ? (
        <Popover
          title={popOverTitle}
          content={popoverContent}
          placement="bottomRight"
        >
          <Dropdown menu={{ items: [...menuItems, ...accountMenuItems] }} trigger={['click']}>
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              {loginInfo?.fullName} <DownOutlined />
            </a>
          </Dropdown>
        </Popover>
      ) : (
        <Dropdown menu={{ items: [...menuItems, ...accountMenuItems] }} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {loginInfo?.fullName} <DownOutlined />
          </a>
        </Dropdown>
      );

    return (
      <div className={styles.shaProfileDropdownWrapper}>
        {subText && <div style={subTextStyling}>{subText}</div>}

        {evaluation.dynamicItems.map((item) => (
          <SingleDynamicItemEvaluator item={item} onEvaluated={onDynamicItemEvaluated} key={item.id} />
        ))}

        <div className={styles.shaProfileDropdown}>
          {renderDropdown()}
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default ProfileDropdown;
