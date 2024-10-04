import React from 'react';

const isContentEmpty = (children) => {
    if (!children) return true;
    if (typeof children === 'string') return children.trim() === '';
    if (Array.isArray(children)) return children.every(isContentEmpty);
    if (typeof children === 'object') {
        if (React.isValidElement(children)) {
            return isContentEmpty(children.props);
        }
        return Object.keys(children).length === 0;
    }
    return false;
};

const AutoHideCollapsible = ({ children }) => {
    const nonEmptyPanels = React.Children.toArray(children).filter(
        child => React.isValidElement(child) && !isContentEmpty(child.props.children)
    );

    if (nonEmptyPanels.length === 0) {
        return null;
    }

    return nonEmptyPanels;
};

export { AutoHideCollapsible };