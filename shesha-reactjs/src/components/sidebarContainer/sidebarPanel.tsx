import React, { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { RightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useStyles } from './styles/styles';
import { ISidebarProps, SidebarPanelPosition } from './models';
import { useForm } from '@/providers';

interface SidebarPanelProps extends ISidebarProps {
    side: SidebarPanelPosition;
    allowFullCollapse: boolean;
    setIsOpenGlobal?: (React.Dispatch<React.SetStateAction<boolean>>) | undefined;
}

/**
 * Used by the SidebarContainer component to render a sidebar panel, to create the Designer Main Area's sidebars.
 */
export const SidebarPanel: FC<SidebarPanelProps> = (props) => {
    const { styles } = useStyles();
    const { side, allowFullCollapse, setIsOpenGlobal } = props;

    const { defaultOpen = true, onOpen, title, onClose, placeholder, content, className } = props;
    var { open } = props;

    var isControllable = open !== undefined;

    var initialState = isControllable ? open : defaultOpen;

    useEffect(() => {
        if (setIsOpenGlobal) setIsOpenGlobal(initialState);
    }, []);

    const [isOpen, setIsOpen] = useState(initialState);
    const realOpen = isControllable ? open : isOpen;
    const rotation = side === 'right' ? (realOpen ? 0 : 180) : realOpen ? 180 : 0;

    const { formMode } = useForm();

    useEffect(() => {
        if (formMode === 'designer') {
            open = undefined;
            isControllable = true;
            setIsOpen(true);
        } else if (formMode === 'edit') {
            open = false;
            isControllable = true;
            setIsOpen(false);
        }
    }, [formMode]);

    const handleClick = () => {
        const handler = realOpen ? onClose : onOpen;
        if (handler) handler();
        if (!isControllable) {
            setIsOpen(!isOpen);
            if (setIsOpenGlobal) setIsOpenGlobal(!isOpen);
        };
    };

    const sideClassName = side === 'right' ? styles.sidebarContainerRight : styles.sidebarContainerLeft;

    return (
        <div
            className={classNames(sideClassName, { open: realOpen }, { 'allow-full-collapse': allowFullCollapse }, className)}
        >
            <div className={styles.sidebarHeader}>
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
            <div className={`${styles.sidebarBody} scroll scroll-y`}>
                <div className={classNames(styles.sidebarBodyContent, { open: realOpen })}>
                    {typeof content === 'function' ? content() : content}
                </div>
                {!allowFullCollapse && <div className={classNames(styles.sidebarBodyPlaceholder, { open: realOpen })} />}
            </div>
        </div>
    );
};
