import React, { FC, useMemo } from 'react';
import { IKeyInformationBarProps } from '@/designer-components/keyInformationBar/interfaces';
import { ComponentsContainer, useFormData } from '@/index';
import { getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { Flex } from 'antd';
import { useStyles } from './style';
import { addPx } from './utils';
import { getSizeStyle } from '@/designer-components/_settings/size/utils';
import { getBorderStyle } from '@/designer-components/_settings/border/utils';

export const KeyInformationBar: FC<IKeyInformationBarProps> = (props) => {
    const { data } = useFormData();
    const {
        columns = [],
        hidden,
        orientation,
        style,
        dividerMargin,
        dividerHeight,
        dividerWidth,
        sizeStyle,
        borderStyle,
        dividerThickness = '0.62px',
        dividerColor,
        gap,
        stylingBox,
        alignItems,
    } = props;
    const { styles } = useStyles();

    const width = addPx(dividerWidth);
    const height = addPx(dividerHeight);
    const margin = dividerMargin ? addPx(dividerMargin) : 0;


    if (hidden) return null;

    const computedStyle = useMemo(() => {
        const stylingBoxJSON = JSON.parse(stylingBox || '{}');
        const sizeStyles = getSizeStyle(sizeStyle);
        const borderStyles = getBorderStyle(borderStyle)
        console.log("Border styles:::", borderStyle);

        return {
            ...getStyle(style, data),
            ...pickStyleFromModel(stylingBoxJSON),
            ...sizeStyles,
            ...borderStyles
        }
    }, [style, stylingBox, sizeStyle, data]);

    const vertical = orientation === "vertical";
    const divThickness = addPx(dividerThickness) !== '100%' ? addPx(dividerThickness) : '0.62px';

    const dividerStyle = {
        backgroundColor: dividerColor ?? '#b4b4b4',
        width: !vertical && width ? divThickness ?? '0.62px' : width,
        height: vertical && height ? divThickness ?? '0.62px' : height,
        margin: vertical ? `${margin} 0` : `0 ${margin}`,
    };

    const barStyle = !vertical ? { justifyContent: alignItems } : { alignItems: alignItems, backgroundColor: '' };

    const containerStyle = (item) => ({
        textAlign: item.textAlign,
        display: "flex",
        flexDirection: item.flexDirection ? item.flexDirection : "column",
        alignItems: item.textAlign,
        overflow: "hidden",
        textOverflow: "ellipsis",
    });

    console.log('Computed Style: ', computedStyle)
    return (
        <Flex vertical={vertical} className={styles.flexContainer} style={{ ...computedStyle, ...barStyle }}>
            {columns.map((item, i) => {
                const itemWidth = vertical ? "100%" : addPx(item.width);
                return (
                    <div key={item.id} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={vertical ? { width: itemWidth, justifyContent: alignItems } : { maxWidth: itemWidth }}>
                        <div key={"divider" + i} className={styles.divider} style={{ ...dividerStyle, alignSelf: "center" }} />
                        <div className={styles.content} style={{ justifyContent: item.textAlign }}>
                            <ComponentsContainer
                                containerId={item.id}
                                gap={gap}
                                wrapperStyle={{ padding: item.padding, maxWidth: vertical ? '100%' : addPx(item.width), boxSizing: "border-box" }}
                                style={containerStyle(item)}
                                dynamicComponents={props?.isDynamic ? item?.components : []}
                            />
                        </div>
                    </div>
                );
            })}
        </Flex>
    );
};

export default KeyInformationBar;
