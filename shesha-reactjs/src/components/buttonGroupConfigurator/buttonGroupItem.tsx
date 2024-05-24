import React, { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';

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
  return (
    <>
      {item.itemSubType === 'button' && (
        <>
          {item.icon && <ShaIcon iconName={item.icon as IconType} />}
          <span className={styles.listItemName}>{item.label || item.name}</span>
          {item.tooltip && (
            <Tooltip title={item.tooltip}>
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