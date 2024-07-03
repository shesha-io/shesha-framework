import { IKeyInformationBarProps } from '@/designer-components/keyInformationBar/interfaces';
import { ComponentsContainer, useFormData } from '@/index';
import { getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { Flex } from 'antd';
import React, { FC } from 'react';
import { useStyles } from './style';

export const KeyInformationBar: FC<IKeyInformationBarProps> = (props) => {

    const { data } = useFormData();
    const { columns, hidden, orientation, style, dividerMargin, dividerHeight, dividerWidth, dividerColor, gap, stylingBox } = props;
    const { styles } = useStyles();

    const width = (/^\d+(\.\d+)?$/.test(dividerWidth) ? `${dividerWidth}px` : dividerWidth);
    const height = (/^\d+(\.\d+)?$/.test(dividerHeight) ? `${dividerHeight}px` : dividerHeight);
    
    if (hidden) return null;

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');
    const vertical = orientation === "vertical";
    const computedStyle = { ...getStyle(style, data), ...pickStyleFromModel(stylingBoxJSON) };

    const containerStyle = (item) => ({
        textAlign: item.textAlign,
        display: "flex",
        flexDirection: item.flexDirection ? item.flexDirection : "column",
        alignItems: item.textAlign,
        maxWidth: item.width - dividerMargin,
    });

    const dividerStyle = () => ({
        backgroundColor: dividerColor ?? '#b4b4b4',
        minHeight: vertical ? '0.62px' : height ?? "100%",
        minWidth: !vertical ? '0.62px' : width ?? "100%",
        width: width,
        height: height,
        margin: dividerMargin && vertical ? `${dividerMargin}px 0px` : `0px ${dividerMargin}px 0px`,
    });

    return (
        <Flex vertical={vertical} className={styles.flexContainer} style={computedStyle} >
            {columns?.map((item, i) => {
                return (
                    <div key={item.id} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={vertical ? { width: item.width } : { maxWidth: item.width + gap }}>
                        <div key={"divider" + i} className={styles.divider} style={{ ...dividerStyle(), alignSelf: "center" }} />
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