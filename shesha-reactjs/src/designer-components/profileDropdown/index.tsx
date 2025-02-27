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
import ConditionalWrap from '@/components/conditionalWrapper';

interface IProfileDropdown extends IConfigurableFormComponent {
  items?: IButtonGroup[];
  subText?: string;
  subTextColor?: string;
  subTextFontSize?: string;
  subTextStyle?: string;
  showUserInfo?: boolean;
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

    const [pop, setPop] = useState<boolean>(false);

    const menuItems = getMenuItem(finalItems, executeAction);

    const accountMenuItems = getAccountMenuItems(accountDropdownListItems, logoutUser);

    const onDynamicItemEvaluated = () => {
      setNumResolved((prev) => prev + 1);
    };

    const onDropdownClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      setPop(false);
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
                <Popover
                  content={popoverContent}
                  placement="bottomRight"
                  trigger="hover"
                  open={pop}
                  onOpenChange={setPop}
                >
                  {children}
                </Popover>
              );
            }}
          >
            <Dropdown menu={{ items: [...menuItems, ...accountMenuItems] }} trigger={['click']}>
              <a className="ant-dropdown-link" onClick={onDropdownClick}>
                {loginInfo?.fullName} <DownOutlined />
              </a>
            </Dropdown>
          </ConditionalWrap>
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default ProfileDropdown;
