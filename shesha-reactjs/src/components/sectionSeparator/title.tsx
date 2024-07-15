import React, { CSSProperties, ReactNode, useRef } from 'react';
import { Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Show from '../show';

interface TitleProps {
    title: string | ReactNode;
    tooltip?: string;
    classes?: any;
    titleStyles?: CSSProperties;
    inline?: boolean;
    titleMargin?: number;
    labelAlign?: 'left' | 'center' | 'right';
}

const Title: React.FC<TitleProps> = ({
    title,
    tooltip,
    classes,
    titleStyles,
    inline,
    labelAlign,
    titleMargin,
}) => {

    const titleRef = useRef<HTMLSpanElement>(null);

    if (!title) return null;

    const getMarginStyle = () => {
        if (inline || labelAlign === 'center') return null;

        return labelAlign === 'left'
            ? { marginLeft: `calc(${titleMargin || 0}%)` }
            : { marginRight: `calc(${titleMargin || 0}%)` };
    };

    return (
        <span style={{ ...titleStyles, ...getMarginStyle() }} ref={titleRef}>
            <Space size="small" style={{ flexWrap: 'nowrap' }}>
                <span >{title}</span>
                <Show when={Boolean(tooltip?.trim())}>
                    <Tooltip title={tooltip}>
                        <QuestionCircleOutlined
                            className={`tooltip-question-icon ${classes.helpIcon}`}
                        />
                    </Tooltip>
                </Show>
            </Space>
        </span>
    );
};

export default Title;