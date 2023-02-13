import React  from 'react';
import Icon, { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const InterfaceOutlinedSvg = () => (
    <svg width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path strokeWidth={0.5} stroke={'black'} d="M11.496 4a3.49 3.49 0 0 0-3.46 3h-3.1a2 2 0 1 0 0 1h3.1a3.5 3.5 0 1 0 3.46-4zm0 6a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
    </svg>
);

export const InterfaceOutlined = (props: Partial<CustomIconComponentProps>) => (
    <Icon component={InterfaceOutlinedSvg} {...props} />
);