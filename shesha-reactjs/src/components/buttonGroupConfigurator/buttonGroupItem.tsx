import React, { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';
import { isPropertySettings } from '@/designer-components/_settings/utils';

const { Text } = Typography;

const DynamicGroupDetails: FC<IDynamicItem> = (props) => {
  const { getProviders } = useDynamicActionsDispatcher();

  const provider = props.dynamicItemsConfiguration?.providerUid
    ? getProviders()[props.dynamicItemsConfiguration?.providerUid]
    : null;

  return (
    <Text type="secondary">{`Dynamic Item(s): ${provider ? provider.contextValue.name : "(not selected)"}`}</Text>
  );
};

export interface IButtonGroupItemProps {
  item: IButtonGroupItem;
}

export const ButtonGroupItem: FC<IButtonGroupItemProps> = ({ item }) => {
  const { styles } = useStyles();

  const label = isPropertySettings(item.label) ? (item.label._value ?? item.name) + ' {JS calculated}' : item.label;
  const tooltip = isPropertySettings(item.tooltip) ? item.tooltip._value + ' {JS calculated}' : item.tooltip;

  return (
    <>
      {item.itemSubType === 'button' && (
        <>
          {item.icon && <ShaIcon iconName={item.icon as IconType} />}
          <span className={styles.listItemName}>{label || item.name}</span>
          {tooltip && (
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} />
            </Tooltip>
          )}
        </>
      )}
      {item.itemSubType === 'separator' && (<Text type="secondary">— separator —</Text>)}
      {isDynamicItem(item) && (<DynamicGroupDetails {...item} />)}
    </>
  );
};