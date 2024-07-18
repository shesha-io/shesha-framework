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

    const marginWidth = `${titleMargin || 0}%`;

    return (
        <div className={styles.titleContainer} style={{
            justifyContent: labelAlign, display: 'flex'
        }} ref={titleRef}>
            <div style={{ width: labelAlign === 'left' ? marginWidth : 0 }} ></div>
            <span style={{ ...titleStyles, whiteSpace: 'nowrap', paddingRight: '8px', }}>{title}</span>
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