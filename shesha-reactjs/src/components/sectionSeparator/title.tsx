import React, { CSSProperties, ReactNode, useRef } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Show from '../show';
import { useStyles } from './styles/styles';

interface TitleProps {
    title: string | ReactNode;
    tooltip?: string;
    titleStyles?: CSSProperties;
    titleMargin?: number;
    labelAlign?: 'left' | 'center' | 'right';
}

const Title: React.FC<TitleProps> = ({
    title,
    tooltip,
    titleStyles,
    labelAlign,
    titleMargin
}) => {

    const titleRef = useRef<HTMLDivElement>(null);
    const { styles } = useStyles();

    if (!title) return null;

    const marginWidth = `calc(${titleMargin || 0}% - ${((titleRef.current?.clientWidth + 14) / 2) || 0}px)`; // 14 is the width of the question mark icon

    return (
        <div className={styles.titleContainer} style={{
            justifyContent: labelAlign, display: 'flex'
        }}>
            <div style={{ width: labelAlign === 'left' ? marginWidth : 0 }} ></div>
            <span ref={titleRef} style={{ ...titleStyles, whiteSpace: 'nowrap' }}>{title}</span>
            <Show when={Boolean(tooltip?.trim())}>
                <Tooltip title={tooltip}>
                    <QuestionCircleOutlined
                        className={`tooltip-question-icon`}
                        style={{ color: '#aaa', marginLeft: '8px' }}
                    />
                </Tooltip>
            </Show>
            <div style={{ width: labelAlign === 'right' ? marginWidth : 0 }} ></div>
        </div>
    );
};

export default Title;