import React, { FC, useEffect, useMemo, useState } from 'react';
import { IButtonGroupItem, IDynamicItem, isDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { Button, Flex, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { IConfigurableActionConfiguration, useDynamicActionsDispatcher, useSheshaApplication } from '@/providers';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getStyle, pickStyleFromModel } from '@/providers/form/utils';
import classNames from 'classnames';
import { addPx } from '@/utils/style';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { initialValues } from './utils';
import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { getBorderStyle } from '@/designer-components/_settings/utils/border/utils';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import { getBackgroundStyle } from '@/designer-components/_settings/utils/background/utils';
import { useActualContextData } from '@/hooks';

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
  const { backendUrl, httpHeaders } = useSheshaApplication();

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
    borderRadius: addPx(borderRadius)
  };


  const prevStyles = migratePrevStyles(model, initialValues());
  const dimensions = prevStyles?.dimensions;
  const border = prevStyles?.border;
  const font = prevStyles?.font;
  const shadow = prevStyles?.shadow;
  const background = prevStyles?.background;
  const styling = JSON.parse(model.stylingBox || '{}');

  const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
  const jsStyle = useMemo(() => getStyle(model.style), [model.style]);
  const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
  const fontStyles = useMemo(() => getFontStyle(font), [font]);
  const [backgroundStyles, setBackgroundStyles] = useState({});
  const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
  const stylingBoxAsCSS = pickStyleFromModel(styling);

  useEffect(() => {
    const fetchStyles = async () => {

      const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
        ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
          { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
          .then((response) => {
            return response.blob();
          })
          .then((blob) => {
            return URL.createObjectURL(blob);
          }) : '';

      const style = getBackgroundStyle(background, jsStyle, storedImageUrl);
      setBackgroundStyles(style);
    };

    fetchStyles();
  }, [background, httpHeaders, backendUrl, jsStyle]);

  const newStyles = {
    ...dimensionsStyles,
    ...(['primary', 'default'].includes(item.buttonType) && borderStyles),
    ...fontStyles,
    ...(['dashed', 'default'].includes(item.buttonType) && backgroundStyles),
    ...(['primary', 'default'].includes(item.buttonType) && shadowStyles),
    ...jsStyle,
    ...stylingBoxAsCSS,
    justifyContent: font?.align,
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
            disabled={readOnly}
            style={{ ...newStyles }}
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