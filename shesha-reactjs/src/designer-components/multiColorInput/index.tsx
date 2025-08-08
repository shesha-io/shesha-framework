import React, { useEffect, useState } from 'react';
import { Button, Row, Tag, Tooltip } from 'antd';
import { nanoid } from '@/utils/uuid';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';
import { removeUndefinedProps } from '@/utils/object';
import { SettingInput } from '../settingsInput/settingsInput';
import { gradientDirectionOptions } from '../_settings/utils/background/utils';
import { InputRow } from '../settingsInputRow';

export const MultiColorInput = ({ value = {}, onChange, readOnly, propertyName }) => {
    const { theme } = useTheme();
    const [colors, setColors] = useState(value);

    useEffect(() => {
        if (!value || Object.entries(value).length === 0) {
            const defaultColors = { '1': theme.application.primaryColor, '2': '#fff' };
            onChange(defaultColors);
            setColors(defaultColors);
        }
    }, [value, onChange, theme.application.primaryColor]);

    return (
        <>
            <Row>
                {Object.entries(removeUndefinedProps(colors)).map(([id]) => {
                    return (
                        <Tag
                            key={id}
                            style={{ backgroundColor: '#fff', padding: 0, margin: 0, display: 'flex', flexDirection: 'row' }}
                            bordered={false}
                            closable={id !== '1' && id !== '2'}
                            onClose={() => {
                                onChange({ ...value, [id]: undefined });
                                setColors({ ...value, [id]: undefined });
                            }}
                        >
                            <SettingInput
                                propertyName={`${propertyName}.${id}`}
                                label='color'
                                hideLabel={true}
                                readOnly={readOnly}
                                type='colorPicker' id={id}
                            />
                        </Tag>
                    );
                })}
                <Tooltip title='Add Color'>
                     <Button
                        type='primary'
                        ghost
                        size='small'
                        style={{marginLeft: 8}}
                        onClick={() => {
                            const id = nanoid();
                            onChange({ ...value, [id]: '#000000' });
                            setColors({ ...colors, [id]: '#000000' });
                        }}
                        disabled={readOnly}
                        icon={<PlusOutlined />}
                     />
                </Tooltip>
            </Row>
            <InputRow inline={true} readOnly={readOnly} inputs={[{ id: nanoid(), propertyName: propertyName.replace('gradient.colors', 'gradient.direction'), label: 'Direction', hideLabel: true, width: '120px', type: 'dropdown', dropdownOptions: gradientDirectionOptions }]}/>
        </>
    );
};

