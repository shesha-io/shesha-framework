import React, { FC } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Button, Flex, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { IConfigurableActionConfiguration, useDynamicActionsDispatcher } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';
import classNames from 'classnames';
import { addPx } from '@/utils/style';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { initialValues } from './utils';
import { useActualContextData } from '@/hooks';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

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

export const ButtonGroupItem: FC<IButtonGroupItemProps> = ({ item, actionConfiguration }) => {
  const { styles } = useStyles();
  const actualItem = useActualContextData({ ...item, actionConfiguration });


  const { icon, label, tooltip, iconPosition, size, buttonType, borderColor, borderRadius,
    height, width, backgroundColor, fontSize, fontWeight, color, borderStyle, borderWidth,
    readOnly, block, danger } = actualItem;

  const model = {
    ...actualItem,
    type: 'button',
    width: addPx(width),
    height: addPx(height),
    backgroundColor: backgroundColor,
    fontSize: addPx(fontSize),
    color: color,
    fontWeight: fontWeight,
    borderWidth: addPx(borderWidth),
    borderColor: borderColor,
    borderStyle: borderStyle,
    borderRadius: addPx(borderRadius),
  };

  const prevStyles = migratePrevStyles(model, initialValues());

  const buttonStyles = useFormComponentStyles(prevStyles);

  const newStyles = {
    ...buttonStyles.dimensionsStyles,
    ...(['primary', 'default', 'ghost'].includes(item.buttonType) && buttonStyles.borderStyles),
    ...buttonStyles.fontStyles,
    ...(['dashed', 'default', 'ghost'].includes(item.buttonType) && buttonStyles.backgroundStyles),
    ...(['primary', 'default', 'dashed', 'ghost'].includes(item.buttonType) && buttonStyles.shadowStyles),
    ...(buttonStyles.jsStyle),
    ...buttonStyles.stylingBoxAsCSS,
    justifyContent: buttonStyles.fontStyles.textAlign,
  };

  return (
    <>
      {item.itemSubType === 'button' && (
        <Flex>
          <Button
            title={tooltip}
            type={buttonType}
            danger={danger}
            icon={icon ? <ShaIcon iconName={icon as IconType} /> : undefined}
            iconPosition={iconPosition}
            className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
            size={size}
            block={block}
            style={{ ...newStyles, ...(readOnly && { cursor: 'not-allowed' }) }}
          >
            {label}
          </Button>
          {tooltip && (
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} style={{ marginLeft: '2px' }} />
            </Tooltip>
          )}
        </Flex>
      )}
      {item.itemSubType === 'separator' && (<Text type="secondary">— separator —</Text>)}
      {isDynamicItem(item) && (<DynamicGroupDetails {...item} />)}
    </>
  );
};
