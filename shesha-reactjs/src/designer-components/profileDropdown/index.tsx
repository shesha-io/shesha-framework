import {
  ConfigurableForm,
  FormIdentifier,
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
import { Avatar, Dropdown, Popover } from 'antd';
import React, { CSSProperties, useMemo, useState } from 'react';
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
import ConditionalWrap from '@/components/conditionalWrapper';

interface IProfileDropdown extends IConfigurableFormComponent {
  items?: IButtonGroup[];
  subText?: string;
  subTextColor?: string;
  subTextFontSize?: string;
  subTextFontWeight?: string;
  subTextFontFamily?: string;
  subTextTextAlign?: CSSProperties['textAlign'];
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
      subTextFontWeight,
      subTextFontFamily,
      subTextTextAlign,
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
    const { executeActionViaConfiguration } = useFormExpression();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const sidebar = useSidebarMenu(false);
    const { accountDropdownListItems } = sidebar || {};

    const subTextStyling = {
      color: subTextColor,
      fontSize: subTextFontSize,
      fontWeight: subTextFontWeight,
      fontFamily: subTextFontFamily,
      textAlign: subTextTextAlign,
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
        const firstVisibleItem = group.childItems?.find((item) => {
          // analyze buttons and groups only
          const isButton = isItem(item) && (item.itemSubType === 'button');
          return (isButton || isGroup(item)) && itemVisibilityFunc(item);
        });
        if (!firstVisibleItem)
          return false;
      }

      return true;
    };

    const getIsVisible = (item: ButtonGroupItemProps): boolean => {
      return (isItem(item) && isVisibleBase(item)) || (isGroup(item) && isGroupVisible(item, getIsVisible));
    };

    const menuItems = getMenuItem(finalItems, executeActionViaConfiguration, getIsVisible);

    const accountMenuItems = getAccountMenuItems(accountDropdownListItems, logoutUser);

    const onDynamicItemEvaluated = (): void => {
      setNumResolved((prev) => prev + 1);
    };

    if (model.hidden) return null;

    const popoverContent = popOverFormId ? (
      <div style={getStyle(popOverContentStyle, formData, globalState)}>
        <ConfigurableForm formId={popOverFormId} mode="readonly" />
      </div>
    ) : (
      <div>Select Popover Form</div>
    );

    return (
      <div className={styles.shaProfileDropdownWrapper}>
        {subText && <div style={subTextStyling}>{subText}</div>}

        {evaluation.dynamicItems.map((item) => (
          <SingleDynamicItemEvaluator item={item} onEvaluated={onDynamicItemEvaluated} key={item.id} />
        ))}

        <div className={styles.shaProfileDropdown}>
          <ConditionalWrap
            condition={showUserInfo}
            wrap={(children) => {
              return (
                <Popover title={popOverTitle} content={popoverContent} placement="bottomRight">
                  {children}
                </Popover>
              );
            }}
          >
            <Dropdown menu={{ items: [...menuItems, ...accountMenuItems] }} trigger={['click']}>
              <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                {loginInfo?.fullName} <DownOutlined />
              </a>
            </Dropdown>
          </ConditionalWrap>
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    );
  },
  settingsFormMarkup: getSettings,
  migrator: (m) => m
    .add<IProfileDropdown>(1, (prev) => (
      {
        ...prev, subTextFontWeight: 'normal',
        subTextFontFamily: 'Arial',
        subTextTextAlign: 'left',
        subTextColor: '#000000',
        subTextFontSize: '12px',
      }
    )),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default ProfileDropdown;
