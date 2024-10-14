import React, { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Button, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { IConfigurableActionConfiguration, useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getActualModel, getStyle } from '@/providers/form/utils';
import { addPx } from '@/designer-components/button/util';
import classNames from 'classnames';
import { useDeepCompareMemo } from '@/hooks';

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
  actionConfiguration?: IConfigurableActionConfiguration;
}

export const ButtonGroupItem: FC<IButtonGroupItemProps> = ({ item, actualModelContext, actionConfiguration }) => {

  const { styles } = useStyles();
  const actualItem = useDeepCompareMemo(() => getActualModel({ ...item, actionConfiguration }, actualModelContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [{ ...item }, { ...actionConfiguration }, { ...actualModelContext }]);

  const { icon, label, tooltip, iconPosition, size, buttonType, borderColor, borderRadius, height, width, backgroundColor, fontSize, fontWeight, color, borderStyle, borderWidth, readOnly, style: itemStyle, block, danger } = actualItem;

  const newStyles = {
    width: addPx(width),
    height: addPx(height),
    backgroundColor: backgroundColor,
    fontSize: addPx(fontSize),
    color: color,
    fontWeight: fontWeight,
    borderWidth: addPx(borderWidth),
    borderColor: borderColor,
    borderStyle: borderStyle,
    borderRadius: addPx(borderRadius)
  };

  return (
    <>
      {item.itemSubType === 'button' && (
        <>
          <Button
            title={tooltip}
            type={buttonType}
            danger={danger}
            icon={icon ? <ShaIcon iconName={icon as IconType} /> : undefined}
            iconPosition={iconPosition}
            className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
            size={size}
            block={block}
            disabled={readOnly}
            style={{ ...getStyle(itemStyle), ...newStyles }}
          >
            {label}
          </Button>
          {tooltip && (
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} style={{ marginLeft: '2px' }} />
            </Tooltip>
          )}
        </>
      )}
      {item.itemSubType === 'separator' && (<Text type="secondary">— separator —</Text>)}
      {isDynamicItem(item) && (<DynamicGroupDetails {...item} />)}
    </>
  );
};