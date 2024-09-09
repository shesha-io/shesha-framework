import { Button, Col, Input, RadioChangeEvent, Row, Tag } from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import React, { FC, useState } from 'react';
import { ColorPicker } from '@/components';
import SizeAndRepeat from './sizeAndRepeat';
import ImageUploader from '../imageUploader';
import { IBackgroundValue } from './interfaces';
import FormItem from '@/designer-components/_settings/components/formItem';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { backgroundTypeOptions, gradientDirectionOptions } from './utils';

interface IBackgroundProps {
    model?: any;
    onChange: (value: any) => void;
}

const BackgroundComponent: FC<IBackgroundProps> = ({ model }) => {
    const { background: value, readOnly } = model;
    const initialColors = value?.gradient?.colors || {};

    const [colors, setColors] = useState<Record<string, string>>(initialColors);

    const addColor = () => {
        const newKey = Date.now().toString(); // Use timestamp for unique keys
        const newColor = '#000000'; // Default to black, or any other default color
        setColors({ ...colors, [newKey]: newColor });
        model.background.gradient.colors[newKey] = newColor; // Update the model as well
    };

    const removeColor = (key: string) => {
        const newColors = { ...colors };
        delete newColors[key];
        setColors(newColors);

        // Update the model as well
        const newGradientColors = { ...model.background.gradient.colors };
        delete newGradientColors[key];
        model.background.gradient.colors = newGradientColors;
    };

    const renderBackgroundInput = () => {
        switch (value?.type) {
            case 'gradient':
                return (
                    <>
                        <SettingInput
                            value={value?.gradient?.direction}
                            property='background.gradient.direction'
                            readOnly={readOnly}
                            label="Direction"
                            type='dropdown'
                            dropdownOptions={gradientDirectionOptions}
                        />
                        <Row>
                            //TODO: use InputRow
                            {Object.entries(colors).map(([key, color]) => (
                                <div>
                                    <Tag
                                        key={key}
                                        bordered={false}
                                        closable
                                        onClose={(e) => {
                                            e.preventDefault();
                                            removeColor(key);
                                        }}
                                    >
                                        <SettingInput
                                            value={value}
                                            property={`background.gradient.colors.${key}`}
                                            readOnly={readOnly}
                                            type='color'
                                            label={color} />
                                    </Tag>
                                </div>
                            ))}

                        </Row>
                        <Button onClick={addColor}>Add color</Button>
                    </>
                );
            case 'url':
                return (
                    <SettingInput
                        value={value?.url}
                        property='background.url'
                        readOnly={readOnly}
                        label="URL"
                    />
                );
            case 'upload':
                return (
                    <FormItem name="background.file" label="File" jsSetting>
                        <ImageUploader
                            backgroundImage={value?.file}
                            readOnly={readOnly}
                        />
                    </FormItem>
                );
            case 'storedFile':
                return (
                    <>
                        <InputRow inputs={[{
                            label: 'File Id',
                            property: 'background.storedFile.id',
                            readOnly: readOnly,
                            value: value?.storedFile?.id,
                        }]} />
                        <FormItem name="background.storedFile.ownerType" label="Owner Type" jsSetting>
                            <Autocomplete.Raw
                                dataSourceType="url"
                                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                                readOnly={readOnly}
                                style={{ width: '100%' }}
                                value={value?.storedFile?.ownerType}
                            />
                        </FormItem>
                        <FormItem name="background.storedFile.ownerId" label="Owner Id" jsSetting>
                            <Input
                                style={{ width: '100%' }}
                                readOnly={readOnly}
                                value={value?.storedFile?.ownerId}
                            />
                        </FormItem>
                        <FormItem name="background.storedFile.fileCatergory" label="File Catergory" jsSetting>
                            <Input
                                style={{ width: '100%' }}
                                readOnly={readOnly}
                                value={value?.storedFile?.fileCatergory}
                            />
                        </FormItem>
                    </>
                );
            default:
                return (
                    <SettingInput
                        value={value?.color}
                        property='background.color'
                        readOnly={readOnly}
                        label="Color"
                        type='color'
                    />
                );
        }
    };

    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }}>
            <SettingInput buttonGroupOptions={backgroundTypeOptions} value={value?.type} property='background.type' readOnly={readOnly} type='radio' label='Type' />
            {renderBackgroundInput()}
            <SizeAndRepeat readOnly={readOnly} backgroundSize={value?.size} backgroundPosition={value?.position} backgroundRepeat={value?.repeat} />
        </Row>
    );
};

export default BackgroundComponent;
