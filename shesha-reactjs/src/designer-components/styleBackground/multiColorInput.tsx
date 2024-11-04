import React, { useEffect, useState } from 'react'
import { SettingInput } from '../_settings/components/settingsInput/settingsInput';
import { Button, Row, Tag } from 'antd';
import { nanoid } from '@/utils/uuid';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';
import FormItem from 'antd/es/form/FormItem';

export const MultiColorInput = ({ value = {}, onChange, readOnly }) => {
    const { theme } = useTheme();
    const [colors, setColors] = useState(value);

    useEffect(() => {
        if (!value || Object.entries(value).length === 0) {
            const defaultColors = { '1': theme.application.primaryColor, '2': '#fff' };
            onChange(defaultColors);
        }
    }, [value, onChange, theme.application.primaryColor]);

    return (
        <>
            <Row>
                {Object.entries(value).map(([id]) => {
                    return (
                        <Tag
                            key={id}
                            style={{ backgroundColor: '#fff', padding: 0, margin: 0, display: 'flex', flexDirection: 'row' }}
                            bordered={false}
                            closable={id !== '1' && id !== '2'}
                            onClose={() => {
                                const newColors = { ...value };
                                delete newColors[id];
                                onChange({ ...newColors });
                            }}
                        >
                            <SettingInput propertyName={`inputStyles.background.gradient.colors.${id}`} label='color' hideLabel={true} readOnly={readOnly} inputType='color' />
                        </Tag>
                    );
                })}
            </Row>
            <FormItem>
                <Button
                    type='primary'
                    ghost
                    size='small'
                    onClick={() => {
                        const id = nanoid();
                        onChange({ ...value, [id]: '#000000' });
                    }}
                    disabled={readOnly}
                    icon={<PlusOutlined />}
                >
                    Add Color
                </Button>
            </FormItem>
        </>
    );
}

