import React, { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Button, Tooltip, Typography } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useButtonGroupConfigurator } from '@/providers/buttonGroupConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

const { Text } = Typography;

export interface IButtonGroupItemProps extends IButtonGroupItem {
  index: number[];
}

const DynamicGroupDetails: FC<IDynamicItem> = (props) => {
  const { getProviders } = useDynamicActionsDispatcher();

  const provider = props.dynamicItemsConfiguration?.providerUid
    ? getProviders()[props.dynamicItemsConfiguration?.providerUid]
    : null;

  return (
    <Text type="secondary">{`Dynamic Item(s): ${provider ? provider.contextValue.name : "(not selected)"}`}</Text>
  );
};

export const ButtonGroupItem: FC<IButtonGroupItemProps> = props => {
  const { styles } = useStyles();
  const { deleteButton, selectedItemId, readOnly } = useButtonGroupConfigurator();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={styles.shaToolbarItemHeader}>
        <DragHandle id={props.id} />
        {props.itemSubType === 'button' && (
          <>
            {props.icon && <ShaIcon iconName={props.icon as IconType} />}
            <span className={styles.shaToolbarItemName}>{props.label || props.name}</span>
            {props.tooltip && (
              <Tooltip title={props.tooltip}>
                <QuestionCircleOutlined className={styles.shaHelpIcon} />
              </Tooltip>
            )}
          </>
        )}
        {props.itemSubType === 'separator' && (<Text type="secondary">— separator —</Text>)}
        {isDynamicItem(props) && (<DynamicGroupDetails {...props} />)}
        {!readOnly && (
          <div className={styles.shaToolbarItemControls}>
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonGroupItem;
