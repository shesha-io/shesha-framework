import { Button, Form, Input, Row, Tag } from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import React, { FC, useEffect } from 'react';
import SizeAndRepeat from './sizeAndRepeat';
import FormItem from '@/designer-components/_settings/components/formItem';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { backgroundTypeOptions, gradientDirectionOptions } from './utils';
import { PlusOutlined } from '@ant-design/icons';
import { IBackgroundValue } from './interfaces';
import { useTheme } from '@/index';
interface IBackgroundProps {
    value?: any;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BackgroundComponent: FC<IBackgroundProps> = (props) => {
    const { value = {}, readOnly, onChange } = props;
    const { theme } = useTheme();

    const background = value || { gradient: { colors: {} } };
    const { gradient } = background;

    useEffect(() => {

        if (!background.type) {
            onChange({ ...value, background: { ...background, type: 'color' } });
        }

        if (!background?.gradient?.colors) {
            const color1 = theme.application.primaryColor;
            const color2 = '#fff';
            onChange({ ...value, background: { ...background, gradient: { ...gradient, colors: [color1, color2] } } });
        }
    }, [background.type]);

    const renderBackgroundInput = (type: IBackgroundValue['type']) => {
        switch (type) {
            case 'gradient':
                return (
                    <>
                        <SettingInput
                            value={gradient?.direction}
                            property='styles.background.gradient.direction'
                            readOnly={readOnly}
                            label="Direction"
                            type='dropdown'
                            dropdownOptions={gradientDirectionOptions}
                        />
                        <Form.List name={["styles", "background", "gradient", "colors"]} initialValue={gradient?.colors}>
                            {(fields, { add, remove }) => (
                                <Row gutter={[8, 8]}>
                                    {fields.map((field) => {
                                        return (
                                            <Tag
                                                key={field.name}
                                                closable={field.key > 1}
                                                onClose={() => {
                                                    remove(field.name);
                                                }}
                                                style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', width: 'max-content' }}
                                            >
                                                <SettingInput value={field.name} property={field.name} label='color' hideLabel={true} readOnly={readOnly} type='color' />
                                            </Tag>
                                        );
                                    })}
                                    <Button
                                        type='primary'
                                        ghost
                                        block
                                        onClick={() => {
                                            const newColor = '#000000';
                                            add(newColor);
                                            onChange({ ...value, background: { ...background, gradient: { ...gradient, colors: [...gradient.colors, newColor] } } });
                                        }}
                                        icon={<PlusOutlined />}
                                    >Add Color</Button>
                                </Row>

                            )}
                        </Form.List >
                    </>
                );
            case 'url':
                return (
                    <SettingInput
                        value={background?.url}
                        property='styles.background.url'
                        readOnly={readOnly}
                        label="URL"
                    />
                );
            case 'upload':
                return (
                    <SettingInput property={'styles.background.file'} label="File" readOnly={readOnly} type='imageUploader' />
                );
            case 'storedFile':
                return (
                    <>
                        <InputRow inputs={[{
                            label: 'File Id',
                            property: 'styles.background.storedFile.id',
                            readOnly: readOnly,
                            value: background?.storedFile?.id,
                        }]} />
                        <FormItem name="styles.background.storedFile.ownerType" label="Owner Type" jsSetting>
                            <Autocomplete.Raw
                                dataSourceType="url"
                                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                                readOnly={readOnly}
                                style={{ width: '100%' }}
                                value={background?.storedFile?.ownerType}
                            />
                        </FormItem>
                        <FormItem name="styles.background.storedFile.ownerId" label="Owner Id" jsSetting>
                            <Input
                                style={{ width: '100%' }}
                                readOnly={readOnly}
                                value={background?.storedFile?.ownerId}
                            />
                        </FormItem>
                        <FormItem name="stylebackground.storedFile.fileCatergory" label="File Catergory" jsSetting>
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
                        property='styles.background.color'
                        readOnly={readOnly}
                        label='Color'
                        type='color'
                    />
                );
        }
    };

    return (
        <>
            <SettingInput buttonGroupOptions={backgroundTypeOptions} value={background?.type || 'color'} property='styles.background.type' readOnly={readOnly} type='radio' label='Type' />
            {renderBackgroundInput(background?.type)}
            <SizeAndRepeat readOnly={readOnly} backgroundSize={background?.size} backgroundPosition={value?.position} backgroundRepeat={value?.repeat} />
        </>
    );
};

export default BackgroundComponent;
