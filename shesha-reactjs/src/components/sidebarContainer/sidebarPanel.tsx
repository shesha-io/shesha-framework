import React, { FC } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useStyles } from './styles/styles';
import { ISidebarProps, SidebarPanelPosition } from './models';

export interface SidebarPanelProps extends ISidebarProps {
    side: SidebarPanelPosition;
    allowFullCollapse: boolean;
    handleClick?: () => void;
    width?: number;
}
export const SidebarPanel: FC<SidebarPanelProps> = (props) => {
    const { styles } = useStyles();
    const { side, allowFullCollapse, width } = props;

    const { open, title, placeholder, content, className, handleClick } = props;

    const rotation = side === 'right' ? (open ? 0 : 180) : open ? 180 : 0;

    const sideClassName = side === 'right' ? styles.sidebarContainerRight : styles.sidebarContainerLeft;

    return (
        <div className={classNames(sideClassName, { open }, { 'allow-full-collapse': allowFullCollapse }, className)}>
            <div className={styles.sidebarHeader} >
                <div className={`${styles.sidebarHeaderTitle} ${side}`}>{typeof title === 'function' ? title() : title}</div>
                <div className={`${styles.sidebarHeaderBtn} ${side}`} onClick={handleClick}>
                    {props.placeholder ? (
                        <Tooltip title={placeholder} placement={side === 'left' ? 'right' : 'left'}>
                            <RightOutlined rotate={rotation} className="toggle-open-btn" />
                        </Tooltip>
                    ) : (
                        <RightOutlined rotate={rotation} className="toggle-open-btn" />
                    )}
                </div>
            </div>
            <div className={`${styles.sidebarBody} scroll scroll-y`} style={{ width }}>
                <div className={classNames(styles.sidebarBodyContent, { open })} >
                    {typeof content === 'function' ? content() : content}
                </div>
                {!allowFullCollapse && <div className={classNames(styles.sidebarBodyPlaceholder, { open })} />}
            </div>
        </div>
    );
};