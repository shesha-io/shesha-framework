import React, { FC } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useStyles } from './styles/styles';
import { ISidebarProps, SidebarPanelPosition } from './models';

interface SidebarPanelProps extends ISidebarProps {
    side: SidebarPanelPosition;
    allowFullCollapse: boolean;
    setIsOpenGlobal?: (isOpen: boolean) => void;
}
export const SidebarPanel: FC<SidebarPanelProps> = (props) => {
    const { styles } = useStyles();
    const { side, allowFullCollapse, setIsOpenGlobal } = props;

    const rotation = side === 'right' ? (open ? 180 : 0) : open ? 180 : 0;

    const { onOpen, title, onClose, placeholder, content, className } = props;

    const isControllable = props?.open !== undefined;
    const realOpen = isControllable ? props?.open : true;

    const handleClick = () => {
        const handler = open ? onClose : onOpen;
        if (handler)
            handler();
        if (!isControllable) {
            setIsOpenGlobal(!props?.open);
        }

    };

    const sideClassName = side === 'right' ? styles.sidebarContainerRight : styles.sidebarContainerLeft;
    console.log('sideClassName', allowFullCollapse, title);
    return (
        <div className={classNames(sideClassName, { open: realOpen }, { 'allow-full-collapse': allowFullCollapse }, className)}>
            <div className={styles.sidebarHeader}>
                <div className={`${styles.sidebarHeaderTitle} ${side}`} style={{ width: '100%' }}>{typeof title === 'function' ? title() : title}</div>
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
            <div className={`${styles.sidebarBody} scroll scroll-y`}>
                <div className={classNames(styles.sidebarBodyContent, { open: realOpen })}>
                    {typeof content === 'function' ? content() : content}
                </div>
                {!allowFullCollapse && <div className={classNames(styles.sidebarBodyPlaceholder, { open: realOpen })} />}
            </div>
        </div>
    );
};