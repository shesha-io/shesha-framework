import { IKeyInformationBarProps } from '@/designer-components/keyInformationBar/interfaces';
import { ComponentsContainer, useFormData } from '@/index';
import { getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { Divider, Flex } from 'antd';
import React, { FC } from 'react';
import { useStyles } from './style';

export const KeyInformationBar: FC<IKeyInformationBarProps> = (props) => {

    const { data } = useFormData();
    const { columns, hidden, alignItems, vertical, style, dividerMargin, dividerHeight, dividerWidth, gap, stylingBox } = props;
    const { styles } = useStyles();

    if (hidden) return null;

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const computedStyle = { ...getStyle(style, data), ...pickStyleFromModel(stylingBoxJSON) };
    const justifyContent = !vertical ? { justifyContent: alignItems } : { alignItems: alignItems };


    const containerStyle = (item) => ({
        textAlign: item.textAlign,
        display: "flex",
        flexDirection: item.flexDirection ? item.flexDirection : "column",
        alignItems: item.textAlign,
    });



    const height = dividerHeight ?? "100%";
    const width = dividerWidth ?? "100%";

    const dividerStyle = {
        height: vertical ? 0 : height,
        width: !vertical ? 0 : width,
        margin: vertical ? `${dividerMargin}px 0px` : `0px ${dividerMargin}px`
    };

    return (
        <Flex vertical={vertical} className={styles.flexContainer} style={{ ...computedStyle, ...justifyContent }} >
            {columns?.map((item, i) => {
                return (
                    <div key={item.id} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={{ width: item.width }}>
                        <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={dividerStyle} />
                        <div className={styles.content} style={{ textAlign: item.textAlign, width: item.width }}>
                            <ComponentsContainer
                                containerId={item.id}
                                gap={gap}
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