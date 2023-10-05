import React, { FC } from 'react';
import { IToolboxComponent } from 'interfaces';
import { DownOutlined, GroupOutlined } from '@ant-design/icons';
import { IButtonGroupComponentProps } from './models';
import { Alert, Button, Divider, Dropdown, Menu, Space } from 'antd';
import { IButtonGroupButton, ButtonGroupItemProps, isItem, isGroup } from 'providers/buttonGroupConfigurator/models';
import { useForm } from 'providers/form';
import { ConfigurableButton } from '../configurableButton';
import { useSheshaApplication } from 'providers';
import { getActualModel, getStyle, useApplicationContext } from 'providers/form/utils';
import { getButtonGroupItems, getButtonGroupMenuItem } from './utils';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { ButtonGroupSettingsForm } from './settings';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import type { MenuProps } from 'antd';
import ShaIcon, { IconType } from 'components/shaIcon/index';

type MenuItem = MenuProps['items'][number];

const ButtonGroupComponent: IToolboxComponent<IButtonGroupComponentProps> = {
  type: 'buttonGroup',
  name: 'Button Group',
  icon: <GroupOutlined />,
  factory: (props: IButtonGroupComponentProps) => {
    const model = { ...props, items: getButtonGroupItems(props) } as IButtonGroupComponentProps;
    const { formMode } = useForm();
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const granted = anyOfPermissionsGranted(model?.permissions || []);

    if ((props.hidden || !granted) && formMode !== 'designer') return null;

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
  ,
  settingsFormFactory: (props) => (<ButtonGroupSettingsForm {...props} />),
};

type MenuButton = ButtonGroupItemProps & {
  childItems?: MenuButton[];
};

type ButtonGroupProps = Pick<IButtonGroupComponentProps, 'items' | 'id' | 'size' | 'spaceSize' | 'isInline' | 'noStyles' >;
export const ButtonGroup: FC<ButtonGroupProps> = ({ items, id, size, spaceSize = 'middle', isInline, noStyles }) => {
  const allData = useApplicationContext();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const isDesignMode = allData.formMode === 'designer';

  // Return the visibility state of a button. A button is visible is it's not hidden and the user is permitted to view it
  const getIsVisible = (item: ButtonGroupItemProps) => {
    const { permissions, hidden } = item;
    const granted = anyOfPermissionsGranted(permissions || []);
    return isDesignMode || !hidden && granted;
  };

  const renderMenuButton = (props: MenuButton): MenuItem => {
    const hasChildren = props?.childItems?.length > 0;

    const buttonProps = props.itemType === 'item' ? (props as IButtonGroupButton) : null;
    const isDivider = buttonProps && (buttonProps.itemSubType === 'line' || buttonProps.itemSubType === 'separator');

    const actualItems =  props?.childItems?.map((item) => getActualModel(item, allData));

    return isDivider
      ? { type: 'divider' }
      : getButtonGroupMenuItem(
        renderButton(props, props?.id),
        props.id,
        props.disabled,
        hasChildren
          ? actualItems?.filter(getIsVisible)?.map((props) => renderMenuButton(props))
          : null
      );
  };

  const renderButton = (props: ButtonGroupItemProps, uuid: string) => {
    return (
      <ConfigurableButton
        formComponentId={id}
        key={uuid}
        {...props}
        size={size}
        style={getStyle(props?.style, allData.data)}
        disabled={props.disabled}
        buttonType={props.buttonType}
      />
    );
  };

  const renderItem = (item: ButtonGroupItemProps, uuid: string) => {
    const itemProps = getActualModel(item, allData) as ButtonGroupItemProps;
    if (isItem(itemProps)) {
      switch (itemProps.itemSubType) {
        case 'button':
          return renderButton(itemProps, uuid);
        case 'separator':
        case 'line':
          return <Divider type='vertical' key={uuid}/>;
        default:
          return null;
      }
    }
    if (isGroup(itemProps)) {
      const menuItems = itemProps.childItems.map(childItem => {
        const actualChildModel = getActualModel(childItem, allData);
        return renderMenuButton({ ...actualChildModel, buttonType: 'link' });
      }); 
      return (
        <Dropdown
          key={uuid}
          menu={{ items: menuItems }}
        >
          <Button
            icon={item.icon ? <ShaIcon iconName={item.icon as IconType} /> : undefined}
            type={itemProps.buttonType}
          >
            {item.label}
            <DownOutlined />
          </Button>
        </Dropdown>
      );
    }
    return null;
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
          {filteredItems?.map((props) =>
            renderItem(props, props?.id)
          )}
        </Space>
      </div>
    );
  } else {
    const menuItems = filteredItems?.map((props) => renderMenuButton(props));
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

export default ButtonGroupComponent;
