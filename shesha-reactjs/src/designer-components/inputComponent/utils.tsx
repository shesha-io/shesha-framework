import React from 'react';
import { Tooltip, Space } from 'antd';
import { ShaIcon, IconType, SectionSeparator, CodeEditor } from '@/components';
import { customIcons } from './icons';
import { startCase } from 'lodash';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';

export const iconElement = (
    icon: string | React.ReactNode,
    size?: any,
    hint?: string,
    style?: React.CSSProperties,
    styles?: any,
    propertyName?: string
) => {
    const icons = require('@ant-design/icons');

    if (typeof icon !== 'string') {
        return icon;
    }

    if (icons[icon]) {
        return (
            <Tooltip title={hint}>
                <ShaIcon iconName={icon as IconType} style={style} />
            </Tooltip>
        );
    }

    if (customIcons[icon]) {
        return (
            <Tooltip title={hint ?? startCase(propertyName?.split('.')[1])}>
                <span style={style}>{customIcons[icon]}</span>
            </Tooltip>
        );
    }

    if (icon === 'sectionSeparator') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                verticalAlign: 'middle',
                top: 10
            }}>
                <Space>
                    {size}
                    <Tooltip className={styles.icon} title={hint}>
                        <SectionSeparator
                            containerStyle={{ margin: 0 }}
                            lineThickness={Number(size[0]) / 2}
                            lineWidth='20'
                            lineColor='#000'
                            fontSize={14}
                            marginBottom='0px'
                        />
                    </Tooltip>
                </Space>
            </div>
        );
    }

    return icon;
};

export const editModes = [
    { value: 'editable', icon: 'editIcon', title: 'Editable' },
    { value: 'readOnly', icon: 'readonlyIcon', title: 'Read only' },
    { value: 'inherited', icon: 'inheritIcon', title: 'Inherit' }
];

export const getEditor = (availableConstantsExpression: string, codeEditorProps: any, constantsAccessor: any) => {
    return availableConstantsExpression?.trim()
        ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor} />
        : <CodeEditorWithStandardConstants {...codeEditorProps} />;
};
