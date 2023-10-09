import React, { FC, useMemo } from 'react';
import { IToolboxComponent } from 'interfaces';
import { DownOutlined, GroupOutlined } from '@ant-design/icons';
import { IButtonGroupComponentProps } from './models';
import { Alert, Button, Divider, Dropdown, Menu, Space } from 'antd';
import { IButtonGroupItem, ButtonGroupItemProps, IButtonGroup, isItem, isGroup, isDynamicItem, IDynamicItem } from 'providers/buttonGroupConfigurator/models';
import { useForm } from 'providers/form';
import { ConfigurableButton } from '../configurableButton';
import { IHasActions, useDynamicActionsDispatcher, useSheshaApplication } from 'providers';
import { getActualModel, getStyle, IApplicationContext, useApplicationContext } from 'providers/form/utils';
import { getButtonGroupMenuItem } from './utils';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { ButtonGroupSettingsForm } from './settings';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import type { MenuProps } from 'antd';
import ShaIcon, { IconType } from 'components/shaIcon/index';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useButtonItems } from './hooks';

type MenuItem = MenuProps['items'][number];

const ButtonGroupComponent: IToolboxComponent<IButtonGroupComponentProps> = {
  type: 'buttonGroup',
  name: 'Button Group',
  icon: <GroupOutlined />,
  factory: (model: IButtonGroupComponentProps) => {
    const { formMode } = useForm();
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const granted = anyOfPermissionsGranted(model?.permissions || []);

    if ((model.hidden || !granted) && formMode !== 'designer') return null;

    // TODO: Wrap this component within ConfigurableFormItem so that it will be the one handling the hidden state. Currently, it's failing. Always hide the component
    return <ButtonGroup {...model} />;
  },
  migrator: (m) => m
    .add<IButtonGroupComponentProps>(0, (prev) => {
      return {
        ...prev,
        items: prev['items'] ?? [],
      };
    })
    .add<IButtonGroupComponentProps>(1, migrateV0toV1)
    .add<IButtonGroupComponentProps>(2, migrateV1toV2)
    .add<IButtonGroupComponentProps>(3, (prev) => ({ ...prev, isInline: prev['isInline'] ?? true, })) /* default isInline to true if not specified */
    .add<IButtonGroupComponentProps>(4, (prev) => {
      const newModel = { ...prev };
      newModel.items = prev.items?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel));
    })
    .add<IButtonGroupComponentProps>(5, (prev) => {
      const newModel = { ...prev };

      const updateItemDefaults = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
        if (isItem(item) && item.itemSubType === 'line')
          return { ...item, itemSubType: 'separator', buttonType: item.buttonType ?? 'link' }; // remove `line`, it works by the same way as `separator`

        if (isGroup(item) && typeof (item.hideWhenEmpty) === 'undefined')
          return {
            ...item,
            buttonType: item.buttonType ?? 'link',
            hideWhenEmpty: true, // set default `hideWhenEmpty` to true by default
            childItems: (item.childItems ?? []).map(updateItemDefaults),
          };

        return { ...item };
      };

      newModel.items = prev.items?.map(updateItemDefaults);
      return newModel;
    })
  ,
  settingsFormFactory: (props) => (<ButtonGroupSettingsForm {...props} />),
};

type MenuButton = ButtonGroupItemProps & {
  childItems?: MenuButton[];
};

type ButtonGroupProps = Pick<IButtonGroupComponentProps, 'items' | 'id' | 'size' | 'spaceSize' | 'isInline' | 'noStyles'>;
export const ButtonGroup: FC<ButtonGroupProps> = ({ items: providedItems, size, spaceSize = 'middle', isInline, noStyles }) => {
  const items = useButtonItems({ items: providedItems });

  const allData = useApplicationContext();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const isDesignMode = allData.formMode === 'designer';

  const isVisibleBase = (item: ButtonGroupItemProps): boolean => {
    const { permissions, hidden } = item;
    if (hidden)
      return false;

    const granted = anyOfPermissionsGranted(permissions || []);
    return granted;
  };

  const isGroupVisible = (group: IButtonGroup): boolean => {
    if (!isVisibleBase(group))
      return false;

    if (group.hideWhenEmpty) {
      const firstVisibleItem = group.childItems.find(item => {
        // analyze buttons and groups only
        return (isItem(item) && item.itemSubType === 'button' || isGroup(item)) && getIsVisible(item);
      });
      if (!firstVisibleItem)
        return false;
    }

    return true;
  };

  // Return the visibility state of a button. A button is visible is it's not hidden and the user is permitted to view it
  const getIsVisible = (item: ButtonGroupItemProps) => {
    if (isDesignMode)
      return true; // show visibility indicator

    return isItem(item) && isVisibleBase(item) || isGroup(item) && isGroupVisible(item);
  };

  const actualItems = items?.map((item) => getActualModel(item, allData));
  const filteredItems = actualItems?.filter(getIsVisible);

  if (actualItems.length === 0 && isDesignMode)
    return (
      <Alert
        className="sha-designer-warning"
        message="Button group is empty. Press 'Customize Button Group' button to add items"
        type="warning"
      />
    );

  if (isInline) {
    return (
      <div className={noStyles ? null : 'sha-responsive-button-group-inline-container'}>
        <Space>
          {filteredItems?.map((item) =>
            (<InlineItem item={item} uuid={item.id} size={size} getIsVisible={getIsVisible} appContext={allData} key={item.id} />)
          )}
        </Space>
      </div>
    );
  } else {
    const menuItems = filteredItems?.map((props) => createMenuItem(props, size, getIsVisible, allData));
    return (
      <div className="sha-responsive-button-group-container">
        <Menu
          mode="horizontal"
          items={menuItems}
          className={`sha-responsive-button-group space-${spaceSize}`}
          style={{ width: '30px' }}
        />
      </div>
    );
  }
};

const renderButton = (props: ButtonGroupItemProps, uuid: string, size: SizeType, appContext: IApplicationContext) => {
  return (
    <ConfigurableButton
      key={uuid}
      {...props}
      size={size}
      style={getStyle(props?.style, appContext.data)}
      disabled={props.disabled}
      buttonType={props.buttonType}
    />
  );
};

type VisibilityEvaluator = (item: ButtonGroupItemProps) => boolean;

const createMenuItem = (props: MenuButton, size: SizeType, getIsVisible: VisibilityEvaluator, appContext: IApplicationContext): MenuItem => {
  const hasChildren = props?.childItems?.length > 0;

  const buttonProps = props.itemType === 'item' ? (props as IButtonGroupItem) : null;
  const isDivider = buttonProps && (buttonProps.itemSubType === 'line' || buttonProps.itemSubType === 'separator');

  return isDivider
    ? { type: 'divider' }
    : getButtonGroupMenuItem(
      renderButton(props, props?.id, size, appContext),
      props.id,
      props.disabled,
      hasChildren
        ? props?.childItems?.filter(getIsVisible)?.map((props) => createMenuItem(props, size, getIsVisible, appContext))
        : null
    );
};

interface InlineItemBaseProps {
  uuid: string;
  size: SizeType;
  getIsVisible: VisibilityEvaluator;
  appContext: IApplicationContext;
}

interface InlineItemProps extends InlineItemBaseProps {
  item: ButtonGroupItemProps;
}
const InlineItem: FC<InlineItemProps> = (props) => {
  const { item, uuid, size, getIsVisible, appContext } = props;

  const itemProps = getActualModel(item, appContext) as ButtonGroupItemProps;
  if (isGroup(itemProps)) {
    const menuItems = itemProps.childItems.filter(item => (getIsVisible(item))).map(childItem => (createMenuItem({ ...childItem, buttonType: 'link' }, size, getIsVisible, appContext)));
    return (
      <Dropdown
        key={uuid}
        menu={{ items: menuItems }}
      >
        <Button
          icon={item.icon ? <ShaIcon iconName={item.icon as IconType} /> : undefined}
          type={itemProps.buttonType}
          title={itemProps.tooltip}
        >
          {item.label}
          <DownOutlined />
        </Button>
      </Dropdown>
    );
  }

  if (isDynamicItem(item)) {
    return (<DynamicInlineItem {...props} item={item} key={uuid} />);
  }

  if (isItem(itemProps)) {
    switch (itemProps.itemSubType) {
      case 'button':
        return renderButton(itemProps, uuid, size, appContext);
      case 'separator':
      case 'line':
        return <Divider type='vertical' key={uuid} />;
      default:
        return null;
    }
  }

  return null;
};

interface DynamicInlineItemProps extends InlineItemBaseProps {
  item: IDynamicItem;
}
const DynamicInlineItem: FC<DynamicInlineItemProps> = (props) => {
  const { item } = props;
  const { getProviders } = useDynamicActionsDispatcher();

  const providerUid = item.dynamicItemsConfiguration?.providerUid;

  const provider = useMemo(() => {
    return providerUid
      ? getProviders()[providerUid]
      : null;
  }, [providerUid]);

  const Component = useMemo(() => {
    return provider
      ? provider.contextValue.renderingHoc(ButtonsList)
      : null;
  }, [provider]);

  return Component
    ? <Component {...props} customProp={'test'} />
    : null;
};

interface IButtonsListComponent extends InlineItemBaseProps {
  customProp: string;
}
const ButtonsList: FC<IButtonsListComponent & IHasActions> = (props) => {
  return (
    <>
      {props.items.map(item => (
        <InlineItem
          item={item}
          uuid={item.id}
          getIsVisible={() => true} 
          appContext={props.appContext}
          size={props.size}
          key={item.id}
        />
      ))}
    </>
  );
};

export default ButtonGroupComponent;