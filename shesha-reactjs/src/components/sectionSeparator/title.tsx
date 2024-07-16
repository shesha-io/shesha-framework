import React, { CSSProperties, ReactNode, useRef } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Show from '../show';

interface TitleProps {
    title: string | ReactNode;
    tooltip?: string;
    classes?: any;
    titleStyles?: CSSProperties;
    titleMargin?: number;
    labelAlign?: 'left' | 'center' | 'right';
    color?: string;
}

const Title: React.FC<TitleProps> = ({
    title,
    tooltip,
    classes,
    titleStyles,
    labelAlign,
    titleMargin
}) => {

    const titleRef = useRef<HTMLDivElement>(null);

    if (!title) return null;

    const marginWidth = `${titleMargin || 0}%`;

    return (
        <div className={classes.titleContainer} style={{ justifyContent: labelAlign, flexWrap: 'nowrap' }} ref={titleRef}>
            <div style={{ width: labelAlign === 'left' ? marginWidth : 0 }} ></div>
            <span style={{ ...titleStyles, whiteSpace: 'nowrap', paddingRight: '8px' }}>{title}</span>
            <Show when={Boolean(tooltip?.trim())}>
                <Tooltip title={tooltip}>
                    <QuestionCircleOutlined
                        className={`tooltip-question-icon`}
                        style={{ color: '#aaa' }}
                    />
                </Tooltip>
            </Show>
            <div style={{ width: labelAlign === 'right' ? marginWidth : 0 }} ></div>
        </div>
    );
};

export default Title;