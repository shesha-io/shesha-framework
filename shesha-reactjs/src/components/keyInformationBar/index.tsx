import { IKeyInformationBarProps } from '@/designer-components/keyInformationBar/interfaces';
import { ComponentsContainer, isValidGuid, useFormData, useSheshaApplication, ValidationErrors } from '@/index';
import { getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { Flex } from 'antd';
import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { useStyles } from './style';
import { addPx } from './utils';
import { removeUndefinedProps } from '@/utils/object';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import { getSizeStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { getBackgroundStyle } from '@/designer-components/_settings/utils/background/utils';
import { getBorderStyle } from '@/designer-components/_settings/utils/border/utils';
export const KeyInformationBar: FC<IKeyInformationBarProps> = (props) => {

    const { data } = useFormData();
    const { columns, hidden, orientation, style, dividerMargin, dividerHeight, dividerWidth, dividerThickness = '0.62px', dividerColor, gap, stylingBox, alignItems } = props;
    const { styles } = useStyles();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = props?.dimensions;
    const border = props?.border;
    const font = props?.font;
    const shadow = props?.shadow;
    const background = props?.background;
    const jsStyle = getStyle(props.style, data);

    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

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
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (props?.background?.type === 'storedFile' && props?.background.storedFile?.id && !isValidGuid(props?.background.storedFile.id)) {
        return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(props.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
        ...stylingBoxAsCSS,
        ...dimensionsStyles,
        ...borderStyles,
        ...fontStyles,
        ...backgroundStyles,
        ...shadowStyles
    });


    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(props?.font?.weight?.split(' - ')[0]) || 400 });


    if (hidden) return null;

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');
    const vertical = orientation === "vertical";
    const computedStyle = { ...getStyle(style, data), ...pickStyleFromModel(stylingBoxJSON) };
    const barStyle = !vertical ? { justifyContent: alignItems } : { alignItems: alignItems };

    const containerStyle = (item) => ({
        textAlign: item.textAlign,
        display: "flex",
        flexDirection: item.flexDirection ? item.flexDirection : "column",
        alignItems: item.textAlign,
        overflow: "hidden",
        textOverflow: "ellipsis",
    });

    const divThickness = addPx(dividerThickness || '0.62px');
    const width = addPx(dividerWidth || '100%');
    const height = addPx(dividerHeight || '100%');
    const margin = dividerMargin ? addPx(dividerMargin || 0) : 0;

    const dividerStyle = {
        backgroundColor: dividerColor ?? '#b4b4b4',
        width: !vertical && width ? divThickness || '0.62px' : width,
        height: vertical && height ? divThickness || '0.62px' : height,
        margin: vertical ? `${margin} 0` : `0 ${margin}`,
    };

    return (
        <Flex vertical={vertical} className={styles.flexContainer} style={{ ...computedStyle, ...barStyle, ...finalStyle }} >
            {columns?.map((item, i) => {
                const itemWidth = vertical ? "100%" : addPx(item.width);
                return (
                    <div key={item.id} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={vertical ? { width: itemWidth, justifyContent: alignItems } : { maxWidth: itemWidth }}>
                        <div key={"divider" + i} className={styles.divider} style={{ ...dividerStyle, alignSelf: "center" }} />
                        <div className={styles.content} style={{ justifyContent: item.textAlign }}>
                            <ComponentsContainer
                                containerId={item.id}
                                gap={gap}
                                wrapperStyle={{ padding: addPx(item.padding || 0), maxWidth: vertical ? '100%' : addPx(item.width), boxSizing: "border-box" }}
                                style={containerStyle(item)}
                                dynamicComponents={props?.isDynamic ? item?.components : []}
                            />
                        </div>
                    </div>);
            })}
        </Flex>
    );
};

export default KeyInformationBar;