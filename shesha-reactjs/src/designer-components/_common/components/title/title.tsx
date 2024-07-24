import React, { ReactNode } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStyles } from './style';

interface TitleProps {
    title: string | ReactNode;
    tooltip?: string;
}

const Title: React.FC<TitleProps> = ({
    title,
    tooltip,
}) => {
    const { styles } = useStyles();

    if (!title) return null;

    return (
        <div className={styles.titleContainer}>
            {title}
            {tooltip?.trim() && (
                <Tooltip title={tooltip}>
                    <QuestionCircleOutlined
                        className={`tooltip-question-icon`}
                        style={{ color: '#aaa', marginLeft: '8px' }}
                    />
                </Tooltip>
            )}
        </div>
    );
};

export default Title;
