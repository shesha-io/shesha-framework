import { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Flex, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { IConfigurableActionConfiguration, useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';
import { useActualContextData } from '@/hooks';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';
import { RenderButton } from '@/designer-components/button/buttonGroup/renderButton';
import { IToolboxComponent } from '@/interfaces';

const { Text } = Typography;

const DynamicGroupDetails: FC<IDynamicItem> = (props) => {
  const { getProviders } = useDynamicActionsDispatcher();
  const provider = isNotNullOrWhiteSpace(props.dynamicItemsConfiguration?.providerUid)
    ? getProviders()[props.dynamicItemsConfiguration.providerUid]
    : null;

  return <Text type="secondary">{`Dynamic Item(s): ${provider ? provider.contextValue.name : "(not selected)"}`}</Text>;
};

export interface IButtonGroupItemProps {
  item: IButtonGroupItem;
  actionConfiguration?: IConfigurableActionConfiguration;
  buttonComponent: IToolboxComponent;
}

export const ButtonGroupItem: FC<IButtonGroupItemProps> = ({ item, actionConfiguration, buttonComponent }) => {
  const { styles } = useStyles();
  const actualItem = useActualContextData({ ...item, actionConfiguration });

  return (
    <>
      {item.itemSubType === 'button' && (
        <Flex>
          <RenderButton props={actualItem} buttonComponent={buttonComponent} />
          {isNotNullOrWhiteSpace(actualItem.tooltip) && (
            <Tooltip title={actualItem.tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} />
            </Tooltip>
          )}
        </Flex>
      )}
      {item.itemSubType === 'separator' && (<Text type="secondary">— separator —</Text>)}
      {isDynamicItem(item) && (<DynamicGroupDetails {...item} />)}
    </>
  );
};
