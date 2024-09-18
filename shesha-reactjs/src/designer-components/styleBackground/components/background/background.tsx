import { Button, Input, Row, Tag } from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import React, { FC, useEffect } from 'react';
import SizeAndRepeat from './sizeAndRepeat';
import ImageUploader from '../imageUploader';
import FormItem from '@/designer-components/_settings/components/formItem';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { backgroundTypeOptions, gradientDirectionOptions } from './utils';
import { nanoid } from '@/utils/uuid';
import { IBackgroundValue } from './interfaces';

interface IBackgroundProps {
    value?: any;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BackgroundComponent: FC<IBackgroundProps> = (props) => {
    const { value = {}, readOnly, onChange } = props;

    const background = value.background || { gradient: {} };
    const { gradient = { colors: { '1': '', '2': '' } } } = background;

    useEffect(() => {
        if (!gradient.colors['1'] && !gradient.colors['2']) {
            onChange({ ...value, background: { ...background, type: 'color', gradient: { colors: { '1': '', '2': '' } } } });
        }
    }, [background]);

    console.log("BACKGROUND VALUE:::", value);

    const addColor = () => {
        const newKey = nanoid();
        onChange({ ...value, background: { ...background, gradient: { ...gradient, colors: { ...gradient?.colors, [newKey]: '' } } } });
    };


    const renderBackgroundInput = () => {
        switch (background?.type) {
            case 'gradient':
                return (
                    <>
                        <SettingInput
                            value={gradient?.direction}
                            property='background.gradient.direction'
                            readOnly={readOnly}
                            label="Direction"
                            type='dropdown'
                            dropdownOptions={gradientDirectionOptions}
                        />
                        <Row gutter={[2, 2]}>
                            {Object.entries(gradient?.colors).map(([key, color]) => (
                                <Tag
                                    key={key}
                                    bordered={false}
                                    closable={key !== '1' && key !== '2'}
                                    onClose={(e) => {
                                        e.preventDefault();
                                        const newColors = { ...gradient.colors };
                                        delete newColors[key];
                                        onChange({ ...value, background: { ...background, gradient: { ...gradient, colors: newColors } } });
                                        const cleanedData = { ...Object.fromEntries(Object.entries(gradient.colors).filter(([key, color]) => color !== undefined)) };
                                        onChange({ ...value, background: { ...background, gradient: { ...gradient, colors: cleanedData } } });
                                    }}
                                    style={{ display: 'inline-flex', width: 'max-content' }}
                                >
                                    <SettingInput
                                        value={color}
                                        property={`background.gradient.colors.${key}`}
                                        readOnly={readOnly}
                                        type='color'
                                        label='' />
                                </Tag>
                            ))}
                        </Row>
                        <Button onClick={addColor}>Add color</Button>
                    </>
                );
            case 'url':
                return (
                    <SettingInput
                        value={background?.url}
                        property='background.url'
                        readOnly={readOnly}
                        label="URL"
                    />
                );
            case 'upload':
                return (
                    <FormItem name="background.file" label="File" jsSetting>
                        <ImageUploader
                            backgroundImage={background?.file}
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
                            value: background?.storedFile?.id,
                        }]} />
                        <FormItem name="background.storedFile.ownerType" label="Owner Type" jsSetting>
                            <Autocomplete.Raw
                                dataSourceType="url"
                                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                                readOnly={readOnly}
                                style={{ width: '100%' }}
                                value={background?.storedFile?.ownerType}
                            />
                        </FormItem>
                        <FormItem name="background.storedFile.ownerId" label="Owner Id" jsSetting>
                            <Input
                                style={{ width: '100%' }}
                                readOnly={readOnly}
                                value={background?.storedFile?.ownerId}
                            />
                        </FormItem>
                        <FormItem name="background.storedFile.fileCatergory" label="File Catergory" jsSetting>
                            <Input
                                style={{ width: '100%' }}
                                readOnly={readOnly}
                                value={background?.storedFile?.fileCatergory}
                            />
                        </FormItem>
                    </>
                );
            default:
                return (
                    <SettingInput
                        value={background?.color}
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
            <SettingInput buttonGroupOptions={backgroundTypeOptions} value={background?.type} property='background.type' readOnly={readOnly} type='radio' label='Type' />
            {renderBackgroundInput()}
            <SizeAndRepeat readOnly={readOnly} backgroundSize={background?.size} backgroundPosition={value?.position} backgroundRepeat={value?.repeat} />
        </>
    );
};

export default BackgroundComponent;
