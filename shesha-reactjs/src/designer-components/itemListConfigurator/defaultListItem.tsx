import React, { FC, useEffect, useMemo, useState } from 'react';
import { DefaultItemRenderingProps } from './interfaces';
import { IconType, ShaIcon } from '@/components';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getActualModel, getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { useSheshaApplication } from '@/providers';
import { getBackgroundStyle } from '../_settings/utils/background/utils';

export interface IListItemProps {
    item: DefaultItemRenderingProps;
    actualModelContext?: any;
}

export const DefaultListItem: FC<IListItemProps> = ({ item, actualModelContext }) => {
    const { label, description, icon } = item;
    const actualItem = useMemo(() => {
        return getActualModel({ label, description, icon }, actualModelContext);
    }, [label, description, icon, actualModelContext]);

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const { styles } = useStyles();
    const dimensions = item?.dimensions;
    const border = item?.border;
    const font = item?.font;
    const shadow = item?.shadow;
    const background = item?.background;

    const jsStyle = getStyle(item.style, item);
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
    const styling = JSON.parse(item.stylingBox || '{}');
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

            const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
            setBackgroundStyles(style);
        };

        fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders, jsStyle]);

    const newStyles = {
        ...dimensionsStyles,
        ...borderStyles,
        ...fontStyles,
        ...backgroundStyles,
        ...shadowStyles,
        ...stylingBoxAsCSS,
        ...jsStyle
    };

    return (
        <>
            {actualItem.icon && <ShaIcon iconName={actualItem.icon as IconType} />}

            <div className={styles.listItemName} style={newStyles}>{actualItem.label}</div>

            {actualItem.description && (
                <Tooltip title={actualItem.description}>
                    <QuestionCircleOutlined className={styles.helpIcon} />
                </Tooltip>
            )}
        </>
    );
};