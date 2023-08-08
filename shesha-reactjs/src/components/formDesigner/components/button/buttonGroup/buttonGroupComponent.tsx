import React, { FC, Fragment } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { GroupOutlined } from '@ant-design/icons';
import { IButtonGroupProps } from './models';
import { Alert, Menu, Space } from 'antd';
import { IButtonGroupButton, ButtonGroupItemProps } from '../../../../../providers/buttonGroupConfigurator/models';
import { useForm } from '../../../../../providers/form';
import { ConfigurableButton } from '../configurableButton';
import { useSheshaApplication, useDataTableSelection, useGlobalState } from '../../../../../providers';
import moment from 'moment';
import { executeExpression, getStyle } from '../../../../../providers/form/utils';
import { getButtonGroupItems, getButtonGroupMenuItem } from './utils';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { ButtonGroupSettingsForm } from './settings';

const ButtonGroupComponent: IToolboxComponent<IButtonGroupProps> = {
  type: 'buttonGroup',
  name: 'Button Group',
  icon: <GroupOutlined />,
  factory: (props: IButtonGroupProps) => {
    const model = { ...props, items: getButtonGroupItems(props) } as IButtonGroupProps;
    const { isComponentHidden, formMode } = useForm();
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const hidden = isComponentHidden({ id: model?.id, isDynamic: model?.isDynamic, hidden: model?.hidden });
    const granted = anyOfPermissionsGranted(model?.permissions || []);

    if ((hidden || !granted) && formMode !== 'designer') return null;

    // TODO: Wrap this component within ConfigurableFormItem so that it will be the one handling the hidden state. Currently, it's failing. Always hide the component
    return <ButtonGroup {...model} />;
  },
  migrator: (m) =>
    m
      .add<IButtonGroupProps>(0, (prev) => {
        return {
          ...prev,
          items: prev['items'] ?? [],
        };
      })
      .add<IButtonGroupProps>(1, migrateV0toV1)
      .add<IButtonGroupProps>(2, migrateV1toV2)
      .add<IButtonGroupProps>(
        3,
        (prev) => ({
          ...prev,
          isInline: prev['isInline'] ?? true,
        }) /* default isInline to true if not specified */
      ),
  settingsFormFactory: (props) => ( <ButtonGroupSettingsForm {...props} />),
};

type MenuButton = ButtonGroupItemProps & {
  childItems?: MenuButton[];
};

export const ButtonGroup: FC<IButtonGroupProps> = ({ items, id, size, spaceSize = 'middle', isInline, noStyles }) => {
  const { formMode, formData, form } = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { globalState } = useGlobalState();
  const { selectedRow } = useDataTableSelection(false) ?? {}; // todo: move to a generic context provider

  const isDesignMode = formMode === 'designer';

  const localexecuteExpression = (expression: string) => {
    const expressionArgs = {
      data: formData ?? {},
      form: form,
      formMode: formMode,
      globalState: globalState,
      moment: moment,
      context: { selectedRow },
    };
    return executeExpression<boolean>(expression, expressionArgs, true, (error) => {
      console.error('Expression evaluation failed', error);
      return true;
    });
  };

  /**
   * Return the visibility state of a button. A button is visible is it's not hidden and the user is permitted to view it
   *
   * @param item
   * @returns
   */
  const getIsVisible = (item: ButtonGroupItemProps) => {
    const { permissions, hidden } = item;

    const isVisibleByCondition = localexecuteExpression(item.customVisibility);

    const granted = anyOfPermissionsGranted(permissions || []);

    return isVisibleByCondition && !hidden && granted;
  };

  const renderMenuButton = (props: MenuButton, isChild = false) => {
    const hasChildren = props?.childItems?.length > 0;

    const disabled = !localexecuteExpression(props.customEnabled);

    const buttonProps = props.itemType === 'item' ? (props as IButtonGroupButton) : null;
    const isDivider = buttonProps && (buttonProps.itemSubType === 'line' || buttonProps.itemSubType === 'separator');

    return isDivider
      ? { type: 'divider' }
      : getButtonGroupMenuItem(
          renderButtonItem(props, props?.id, disabled),
          props.id,
          disabled,
          hasChildren ? props?.childItems?.filter(getIsVisible)?.map((props) => renderMenuButton(props, isChild)) : null
        );
  };

  const renderButtonItem = (item: ButtonGroupItemProps, uuid: string, disabled = false, isChild = false) => {
    const itemProps = item as IButtonGroupButton;

    return (
      <ConfigurableButton
        formComponentId={id}
        key={uuid}
        {...itemProps}
        size={size}
        style={getStyle(item?.style, formData)}
        disabled={disabled}
        buttonType={isChild ? 'link' : item.buttonType}
      />
    );
  };

  const filteredItems = items?.filter(getIsVisible);

  if (items.length === 0 && isDesignMode)
    return (
      <Alert
        className="sha-designer-warning"
        message="Button group is empty. Press 'Customize Button Group' button to add items"
        type="warning"
      />
    );

  return (
    <Fragment>
      {isInline && (
        <div className={noStyles ? null : 'sha-responsive-button-group-inline-container'}>
          <Space>
            {filteredItems?.map((props) =>
              renderButtonItem(props, props?.id, !localexecuteExpression(props.customEnabled))
            )}
          </Space>
        </div>
      )}

      {!isInline && (
        <div className="sha-responsive-button-group-container">
          <Menu
            mode="horizontal"
            items={filteredItems?.map((props) => renderMenuButton(props))}
            className={`sha-responsive-button-group space-${spaceSize}`}
            style={{ width: '30px' }}
          />
        </div>
      )}
    </Fragment>
  );
};

export default ButtonGroupComponent;
