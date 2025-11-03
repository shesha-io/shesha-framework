import {
  IConfigurableFormComponent,
  IToolboxComponent,
  useAuth,
  useForm,
  useFormExpression,
  useGlobalState,
  useSidebarMenu,
  useSheshaApplication,
} from '@/index';
import {
  ButtonGroupItemProps,
  IButtonGroup,
  isGroup,
  isItem,
} from '@/providers/buttonGroupConfigurator/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
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
}

const ProfileDropdown: IToolboxComponent<IProfileDropdown> = {
  type: 'profileDropdown',
  name: 'Profile Dropdown',
  isInput: false,
  canBeJsSetting: false,
  icon: <UserOutlined />,
  Factory: ({ model }) => {
    const [numResolved, setNumResolved] = useState(0);

    const { subText, subTextColor, subTextFontSize, subTextStyle } = model;

    const { styles } = useStyles({
      subText,
    });
    const { loginInfo, logoutUser } = useAuth();
    const { formData, formMode } = useForm();
    const { globalState } = useGlobalState();
    const { executeAction } = useFormExpression();
    const { anyOfPermissionsGranted } = useSheshaApplication();

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

    const isDesignMode = formMode === 'designer';

    // Visibility checker functions (similar to ButtonGroup)
    const isVisibleBase = (item: ButtonGroupItemProps): boolean => {
      const { permissions, hidden } = item;
      if (hidden)
        return false;

      const granted = anyOfPermissionsGranted(permissions || []);
      return granted;
    };

    type ItemVisibilityFunc = (item: ButtonGroupItemProps) => boolean;

    const isGroupVisible = (group: IButtonGroup, itemVisibilityFunc: ItemVisibilityFunc): boolean => {
      if (!isVisibleBase(group))
        return false;

      if (group.hideWhenEmpty) {
        const firstVisibleItem = group.childItems?.find(item => {
          // analyze buttons and groups only
          const isButton = isItem(item) && (item.itemSubType === 'button');
          return (isButton || isGroup(item)) && itemVisibilityFunc(item);
        });
        if (!firstVisibleItem)
          return false;
      }

      return true;
    };

    // Return the visibility state of a button. A button is visible if it's not hidden and the user is permitted to view it
    const getIsVisible = (item: ButtonGroupItemProps): boolean => {
      if (isDesignMode)
        return true; // show all items in design mode

      return isItem(item) && isVisibleBase(item) || isGroup(item) && isGroupVisible(item, getIsVisible);
    };

    const menuItems = getMenuItem(finalItems, executeAction, getIsVisible);

    const accountMenuItems = getAccountMenuItems(accountDropdownListItems, logoutUser);

    const onDynamicItemEvaluated = () => {
      setNumResolved((prev) => prev + 1);
    };

    if (model.hidden) return null;

    return (
      <div className={styles.shaProfileDropdownWrapper}>
        {subText && <div style={subTextStyling}>{subText}</div>}

        {evaluation.dynamicItems.map((item) => (
          <SingleDynamicItemEvaluator item={item} onEvaluated={onDynamicItemEvaluated} key={item.id} />
        ))}

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
