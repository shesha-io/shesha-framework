import React, { FC, useMemo } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getActualModel } from '@/providers/form/utils';

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
  actualModelContext?: any;
}

export const ButtonGroupItem: FC<IButtonGroupItemProps> = ({ item, actualModelContext }) => {
  const { styles } = useStyles();
  const actualItem = useMemo(() => getActualModel(item, actualModelContext)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    , [item.label, item.icon, item.tooltip, item.name, actualModelContext]);

  const { icon, label, tooltip, name } = actualItem;

  return (
    <>
      {item.itemSubType === 'button' && (
        <>
          {icon && <ShaIcon iconName={icon as IconType} />}
          <span className={styles.listItemName}>{label || name}</span>
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