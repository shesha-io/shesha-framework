import { Alert, Menu, Space } from 'antd';
import moment from 'moment';
import React, { FC, Fragment } from 'react';
import { useDataTable, useGlobalState, useSheshaApplication } from '../../../../../providers';
import { ButtonGroupItemProps/*, IButtonGroupButton*/ } from '@/providers/buttonGroupConfigurator/models';
import { useForm } from '@/providers/form';
import { executeExpression, getStyle } from '@/providers/form/utils';
import { ConfigurableButton } from '../configurableButton';
import { IButtonGroupComponentProps } from './models';
import { getButtonGroupMenuItem } from './utils';

type MenuButton = ButtonGroupItemProps & {
  childItems?: MenuButton[];
};

export const ButtonGroup: FC<IButtonGroupComponentProps> = ({ items, id, size, spaceSize = 'middle', isInline, noStyles }) => {
  const { formMode, formData, form } = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { globalState } = useGlobalState();
  const { selectedRow } = useDataTable(false) ?? {}; // todo: move to a generic context provider

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

    const buttonProps = props.itemType === 'item' ? (props as any/*IButtonGroupButton*/) : null;
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
    const itemProps = item as any;//IButtonGroupButton;

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

export default ButtonGroup;
