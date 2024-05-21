import React, { FC, useState } from 'react';
import { SidebarPanel, SidebarPanelProps } from './sidebarPanel';
import { useStyles } from './styles/styles';
import { Resizable } from 're-resizable';

interface ResizableWrapperProps extends SidebarPanelProps {
    configurator?: any;
    resizable?: boolean;
}

const ResizableWrapper: FC<ResizableWrapperProps> = ({
    onOpen,
    onClose,
    defaultOpen = true,
    open,
    configurator,
    resizable,
    side,
    ...props
}) => {
    const { styles } = useStyles();

    const isControllable = open !== undefined;

    const [isOpen, setIsOpen] = useState(isControllable ? open : defaultOpen);
    const [width, setWidth] = useState(365);

    const realOpen = isControllable ? open : isOpen;

    const handleClick = () => {
        const handler = realOpen ? onClose : onOpen;
        if (handler) handler();
        if (!isControllable) setIsOpen(!isOpen);
    };

    if (!resizable || (resizable && !realOpen)) {
        return <SidebarPanel {...props} side={side} handleClick={handleClick} open={realOpen} />;
    }

    const isLeft = side === 'left';

    return (
        <Resizable
            minWidth={350}
            maxWidth={550}
            defaultSize={{ width: 365, height: '100%' }}
            onResize={(_, __, ref) => {
                setWidth(parseInt(ref.style.width, 10));
            }}
            className={isLeft ? styles.leftResizer : styles.rightResizer}
            boundsByDirection
            enable={{ right: true, left: !isLeft }}
        >
            <SidebarPanel
                {...props}
                handleClick={handleClick}
                side={side}
                open={realOpen}
                width={width}
                configurator={configurator}
            />
        </Resizable>
    );
};

export default ResizableWrapper;