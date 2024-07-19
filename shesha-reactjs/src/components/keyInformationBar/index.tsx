import { IKeyInformationBarProps } from '@/designer-components/keyInformationBar/interfaces';
import { ComponentsContainer, useFormData } from '@/index';
import { getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { Flex } from 'antd';
import React, { FC } from 'react';
import { useStyles } from './style';
import { addPx } from './utils';
export const KeyInformationBar: FC<IKeyInformationBarProps> = (props) => {

    const { data } = useFormData();
    const { columns, hidden, orientation, style, dividerMargin, dividerHeight, dividerWidth, dividerThickness = '0.62px', dividerColor, gap, stylingBox, alignItems, backgroundColor } = props;
    const { styles } = useStyles();

    console.log('columns', columns);
    console.log('Props', props);

    const width = addPx(dividerWidth);
    const height = addPx(dividerHeight);
    const margin = dividerMargin ? addPx(dividerMargin) : 0;


    if (hidden) return null;

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');
    const vertical = orientation === "vertical";
    const computedStyle = { ...getStyle(style, data), ...pickStyleFromModel(stylingBoxJSON) };
    const barStyle = !vertical ? { justifyContent: alignItems, backgroundColor } : { alignItems: alignItems, backgroundColor };

    const containerStyle = (item) => ({
        textAlign: item.textAlign,
        display: "flex",
        flexDirection: item.flexDirection ? item.flexDirection : "column",
        alignItems: item.textAlign,
        overflow: "hidden",
        textOverflow: "ellipsis",
    });

    const divThickness = addPx(dividerThickness) !== '100%' ? addPx(dividerThickness) : '0.62px';

    const dividerStyle = {
        backgroundColor: dividerColor ?? '#b4b4b4',
        width: !vertical && width ? divThickness ?? '0.62px' : width,
        height: vertical && height ? divThickness ?? '0.62px' : height,
        margin: vertical ? `${margin} 0` : `0 ${margin}`,
    };

    return (
        <Flex vertical={vertical} className={styles.flexContainer} style={{ ...computedStyle, ...barStyle }} >
            {columns?.map((item, i) => {
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
                    </div>);
            })}
        </Flex>
    );
};

export default KeyInformationBar;