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

    const menuItems = getMenuItem(finalItems, executeActionViaConfiguration);

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
  settingsFormMarkup: (data) => getSettings(data),
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
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default ProfileDropdown;
