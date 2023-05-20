import React, { FC } from 'react';
import { CollapsiblePanel, ICollapsiblePanelProps } from 'components';

interface ISettingsCollapsiblePanelProps extends ICollapsiblePanelProps {
    propertyFilter: (name: string) => boolean;
}

const SettingsCollapsiblePanel: FC<ISettingsCollapsiblePanelProps> = (props) => {
    let show = true;
    let children = props.children;

    if (typeof props.propertyFilter === 'function') {
        const fileds: string[] = [];
        const childrenWithProps = (children)  => {
            return React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    const p = child['props'];
                    if (child.type['name'] === 'SettingsFormItem') {
                        fileds.push(p['name']);
                        if (!Boolean(p['propertyFilter'])) {
                            return React.cloneElement<any>(child, { propertyFilter: props.propertyFilter });
                        }
                        return child;
                    }
                    if (p['children']) {
                        const c = childrenWithProps(p['children']);
                        return React.cloneElement<any>(child, { children: c });
                    }
                }
                return child;
            });
        };
        children = childrenWithProps(children);
        show = Boolean(fileds.find(x => {
            return props.propertyFilter(x);
        }));
    }
    return show ? <CollapsiblePanel  ghost={true} expandIconPosition='left' {...props}>{children}</CollapsiblePanel> : null;
};

export default SettingsCollapsiblePanel;
