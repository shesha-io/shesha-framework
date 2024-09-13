import { Button, Input, Row, Tag } from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import React, { FC, useEffect, useState } from 'react';
import SizeAndRepeat from './sizeAndRepeat';
import ImageUploader from '../imageUploader';
import FormItem from '@/designer-components/_settings/components/formItem';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { backgroundTypeOptions, gradientDirectionOptions } from './utils';
import { nanoid } from '@/utils/uuid';
import { useFormDesignerActions } from '@/providers/formDesigner';
import { IBackgroundValue } from './interfaces';

interface IBackgroundProps {
    model?: any;
    value?: IBackgroundValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BackgroundComponent: FC<IBackgroundProps> = (props) => {
    const { value, readOnly, model } = props;

    console.log("Background Component", props);
    const { updateComponent } = useFormDesignerActions();
    const [colors, setColors] = useState<Record<string, string>>(value?.gradient?.colors || {});

    const addColor = () => {
        const newKey = nanoid();
        setColors({ ...colors, [newKey]: '' });
        value.gradient.colors[newKey] = '';
    };

    const removeColor = (key: string) => {
        const newColors = { ...colors };
        delete newColors[key];
        setColors(newColors);

        const newGradientColors = { ...value.gradient.colors };
        delete newGradientColors[key];
        value.gradient.colors = newGradientColors;
        updateComponent({
            componentId: model.id, settings: {
                ...model,
                type: model.type
            }
        });

    };

    useEffect(() => {
        const updatedColors = { '1': '', '2': '', ...value?.gradient?.colors };
        setColors(updatedColors);
    }, [model?.background?.gradient?.colors]);

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
                        <Row gutter={[2, 2]}>
                            {Object.entries(colors).map(([key, color]) => (
                                <Tag
                                    key={key}
                                    bordered={false}
                                    closable={key !== '1' && key !== '2'}
                                    onClose={(e) => {
                                        e.preventDefault();
                                        removeColor(key);
                                    }}
                                    style={{ width: '75px' }}
                                >
                                    <SettingInput
                                        value={value}
                                        property={`background.gradient.colors.${key}`}
                                        readOnly={readOnly}
                                        type='color'
                                        label={color} />
                                </Tag>
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
        <>
            <SettingInput buttonGroupOptions={backgroundTypeOptions} value={value?.type} property='background.type' readOnly={readOnly} type='radio' label='Type' />
            {renderBackgroundInput()}
            <SizeAndRepeat readOnly={readOnly} backgroundSize={value?.size} backgroundPosition={value?.position} backgroundRepeat={value?.repeat} />
        </>
    );
};

export default BackgroundComponent;
