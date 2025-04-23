import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { Button, Form, FormInstance } from "antd";
import ConfigurableButton from "@/designer-components/button/configurableButton";
import { pickStyleFromModel, useTheme } from "@/index";
import { useStyles } from "./styles";
import { fadeColor } from "@/providers/refList/provider/utils";
import { IChevronButton, IChevronControlProps } from "./models";
import classNames from "classnames";
import { addPx } from '@/utils/style';
import { getFontStyle } from "@/designer-components/_settings/utils/font/utils";


export const ChevronControl: FC<IChevronControlProps> = (props) => {
    const fontStyles = useMemo(() => getFontStyle(props?.font), [props?.font]);
    const { value, activeColor, showIcons, colorSource, items, width, height, stylingBox } = props;
    const { styles } = useStyles({ height });
    const [form] = Form.useForm();
    const { theme } = useTheme();
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const containerRef = useRef(null);
    const stylingBoxJSON = JSON.parse(stylingBox || '{}');
    const stylingBoxCSS = pickStyleFromModel(stylingBoxJSON);    

    const renderButton = (props: IChevronButton, uuid: string, form?: FormInstance<any>) => {
        function getColor(source: string) {
            switch (source) {
                case 'primary':
                    return theme.application.primaryColor;
                case 'custom':
                    return activeColor ?? theme.application.primaryColor;
                case 'reflist':
                    return props?.color ?? theme.application.primaryColor;
                default:
                    return theme.application.primaryColor;
            }
        }

        const newStyles: CSSProperties = {
            backgroundColor: props.itemValue === value ? getColor(colorSource) : fadeColor(getColor(colorSource), 70),
            clipPath: 'polygon(95% 0, 100% 50%, 95% 100%, 0% 100%, 5% 50%, 0% 0%)',
            textAlign: 'center',
            cursor: 'pointer',
            outline: 'none',
            width: addPx(width) ?? '150px',
            height: addPx(height) ?? '35px',
            borderRadius: '0px',
            ...fontStyles
        };

        return !props.hidden && (
            <div className={styles.chevronButton}>
                <ConfigurableButton
                    key={uuid}
                    {...props}
                    icon={showIcons ? props.icon : null}
                    style={{...newStyles, ...stylingBoxCSS}}
                    readOnly={props.readOnly}
                    buttonType='text'
                    form={form}
                    label={props.item}
                />
            </div>
        );
    };

    useEffect(() => {
        const container = containerRef.current;
        const handleScroll = () => {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Call once to set initial state

        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scroll = (e, scrollOffset: number) => {
        e.preventDefault();
        containerRef.current.scrollLeft += scrollOffset;
    };


    return (
        <div className={styles.pipelineContainer}>
            {showLeftArrow && (
                <Button onClick={(e) => scroll(e, -100)} className={classNames(styles.arrowButton, styles.leftArrow)}>
                    &#8249;
                </Button>
            )}
            <div ref={containerRef} className={styles.pipelineStages}>
                {items?.map((item) => {
                    return renderButton(item, item.id, form);
                })}
            </div>
            {showRightArrow && (
                <Button onClick={(e) => scroll(e, 100)} className={classNames(styles.arrowButton, styles.rightArrow)}>
                    &#8250;
                </Button>
            )}
        </div>
    );
};


