import React, { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '../../../../../providers/buttonGroupConfigurator/models';
import { Button, Tooltip, Typography } from 'antd';
import { DeleteFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';
import DragHandle from './dragHandle';
import ShaIcon, { IconType } from '../../../../shaIcon';
import { useDynamicActionsDispatcher } from 'index';

const { Text } = Typography;

export interface IButtonGroupItemProps extends IButtonGroupItem {
  index: number[];
}

export const ButtonGroupItem: FC<IButtonGroupItemProps> = props => {
  const { deleteButton, selectedItemId, readOnly } = useButtonGroupConfigurator();

  const onDeleteClick = () => {
    deleteButton(props.id);
  };

  const classes = ['sha-button-group-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-button-group-item-header">
        <DragHandle id={props.id} />
        {props.itemSubType === 'button' && (
          <>
            {props.icon && <ShaIcon iconName={props.icon as IconType} />}
            <span className="sha-button-group-item-name">{props.label || props.name}</span>
            {props.tooltip && (
              <Tooltip title={props.tooltip}>
                <QuestionCircleOutlined className="sha-help-icon" />
              </Tooltip>
            )}
          </>
        )}
        {props.itemSubType === 'separator' && (<Text type="secondary">— separator —</Text>)}
        {isDynamicItem(props) && (<DynamicGroupDetails {...props}/>)}
        {!readOnly && (
          <div className="sha-button-group-item-controls">
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
    </div>
  );
};

const DynamicGroupDetails: FC<IDynamicItem> = (props) => {
  const { getProviders } = useDynamicActionsDispatcher();
  
  const provider = props.dynamicItemsConfiguration?.providerUid
    ? getProviders()[props.dynamicItemsConfiguration?.providerUid]
    : null;

  return (
    <Text type="secondary">{ `Dynamic Item(s): ${provider ? provider.contextValue.name : "(not selected)"}` }</Text>
  );
};

export default ButtonGroupItem;
