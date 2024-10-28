import { Button, Row, Tag } from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import React, { FC, useEffect, useState } from 'react';
import SizeAndRepeat from './sizeAndRepeat';
import FormItem from '@/designer-components/_settings/components/formItem';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { backgroundTypeOptions, gradientDirectionOptions } from './utils';
import { PlusOutlined } from '@ant-design/icons';
import { IBackgroundValue } from './interfaces';
import { useTheme } from '@/index';
import { removeNullUndefined } from '@/providers/utils';
import { nanoid } from '@/utils/uuid';
import { SettingInput } from '../_settings/components/settingsInput';
interface IBackgroundProps {
    value?: IBackgroundValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BackgroundComponent: FC<IBackgroundProps> = (props) => {
    const { value, readOnly, onChange } = props;
    const { theme } = useTheme();
    const [colors, setColors] = useState<{}>(value?.gradient?.colors || {});

    useEffect(() => {
        if (!value?.gradient?.colors) {
            setColors({ '1': theme.application.primaryColor, '2': '#fff' });
            onChange({ ...value, gradient: { colors: { 1: theme.application.primaryColor, 2: '#fff' } } });
        }
    }, [value]);

    const renderBackgroundInput = (type: IBackgroundValue['type']) => {
        switch (type) {
            case 'gradient':
                return (
                    <>
                        <SettingInput
                            propertyName='inputStyles.background.gradient.direction'
                            readOnly={readOnly}
                            label="Direction"
                            inputType='dropdown'
                            tooltip='The angle or direction of color transition'
                            dropdownOptions={gradientDirectionOptions}
                        />

                        <Row>
                            {Object.entries(colors).map(([id]) => {
                                return (
                                    <Tag
                                        key={id}
                                        style={{ backgroundColor: '#fff', padding: 0, margin: 0, display: 'flex', flexDirection: 'row' }}
                                        bordered={false}
                                        closable={id !== '1' && id !== '2'}
                                        onClose={() => {
                                            const newColors = { ...colors };
                                            delete newColors[id];
                                            setColors(newColors);
                                            onChange({ ...value, gradient: { ...value.gradient, colors: newColors } });
                                        }}
                                    >
                                        <SettingInput propertyName={`inputStyles.background.gradient.colors.${id}`} label='color' hideLabel={true} readOnly={readOnly} inputType='color' />
                                    </Tag>
                                );
                            })}
                            <Button
                                type='primary'
                                ghost
                                block
                                size='small'
                                onClick={() => {
                                    const id = nanoid();
                                    const newColor = '';
                                    setColors({ ...colors, [id]: newColor });
                                    onChange({ ...value, background: { ...value, gradient: { ...value?.gradient, colors: { ...value?.gradient?.colors, [id]: newColor } } } });
                                }}
                                disabled={readOnly}
                                icon={<PlusOutlined />}
                            >
                                Add Color
                            </Button>
                        </Row>
                    </>
                );
            case 'url':
                return (
                    <SettingInput
                        propertyName='inputStyles.background.url'
                        readOnly={readOnly}
                        label="URL"
                    />
                );
            case 'upload':
                return (
                    <SettingInput propertyName={'inputStyles.background.file'} label="File" readOnly={readOnly} inputType='imageUploader' />
                );
            case 'storedFile':
                return (
                    <>
                        <InputRow readOnly={readOnly} inputs={[{
                            label: 'File Id',
                            propertyName: 'inputStyles.background.storedFile.id',
                            readOnly: readOnly
                        }, {
                            propertyName: "inputStyles.background.storedFile.ownerId",
                            label: "Owner Id",
                            readOnly: readOnly
                        }]} />
                        <InputRow readOnly={readOnly} inputs={[{
                            propertyName: "inputStyles.background.storedFile.ownerType",
                            label: "Owner Type",
                            inputType: "typeAutocomplete",
                            readOnly: readOnly
                        },
                        {
                            propertyName: "inputStyles.background.storedFile.fileCatergory",
                            label: "File Catergory",
                            readOnly: readOnly
                        }]} />
                    </>
                );
            default:
                return (
                    <SettingInput
                        propertyName='inputStyles.background.color'
                        readOnly={readOnly}
                        label='Color'
                        inputType='color'
                    />
                );
        }
    };

    return (
        <>
            <SettingInput buttonGroupOptions={backgroundTypeOptions} propertyName='inputStyles.background.type' readOnly={readOnly} inputType='radio' label='Type' />
            {renderBackgroundInput(value?.type)}
            <SizeAndRepeat readOnly={readOnly} />
        </>
    );
};

export default BackgroundComponent;
