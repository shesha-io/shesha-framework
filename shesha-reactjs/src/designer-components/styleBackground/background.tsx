import { Button, Input, Row, Tag } from 'antd';
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
    value?: any;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BackgroundComponent: FC<IBackgroundProps> = (props) => {
    const { value, readOnly, onChange } = props;
    const { theme } = useTheme();
    const [colors, setColors] = useState<{}>(value?.background?.gradient?.colors || {});

    console.log("VALUE:::", value, 'colors::', colors);

    useEffect(() => {
        if (value?.background?.gradient?.colors) {
            setColors({ 1: theme.application.primaryColor, 2: '#fff' });
            onChange({ ...value, background: { ...value?.background, gradient: { ...value?.background?.gradient, colors: { 1: theme.application.primaryColor, 2: '#fff' } } } });
        }
    }, []);

    const background = value || { gradient: { colors: [] } };
    const { gradient } = background;

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
                            inputType='dropdown'
                            dropdownOptions={gradientDirectionOptions}
                        />

                        <Row>
                            {Object.entries(colors).map(([id, color]) => {
                                console.log("COLOR:::", color);
                                return (
                                    <Tag
                                        key={id}
                                        bordered={false}
                                        closable={id !== '1' && id !== '2'}
                                        onClose={() => {
                                            const newColors = { ...gradient.colors };
                                            delete newColors[id];
                                            setColors(removeNullUndefined(newColors));
                                            onChange({ ...value, background: { ...background, gradient: { ...gradient?.colors, colors: removeNullUndefined(newColors) } } });
                                        }}
                                        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', width: 'max-content' }}
                                    >
                                        <SettingInput value={color} property={`styles.background.gradient.colors.${id}`} label='color' hideLabel={true} readOnly={readOnly} inputType='color' />
                                    </Tag>
                                );
                            })}
                            <Button
                                type='primary'
                                ghost
                                block
                                onClick={() => {
                                    const id = nanoid();
                                    const newColor = '#000000';
                                    setColors({ ...colors, [id]: newColor });
                                    onChange({ ...value, background: { ...background, gradient: { ...gradient, colors: { ...gradient?.colors, [id]: newColor } } } });
                                }}
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
                        value={background?.url}
                        property='styles.background.url'
                        readOnly={readOnly}
                        label="URL"
                    />
                );
            case 'upload':
                return (
                    <SettingInput property={'styles.background.file'} label="File" readOnly={readOnly} inputType='imageUploader' />
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
                        <SettingInput property="styles.background.storedFile.ownerId" label="Owner Id" readOnly={readOnly} />
                        <SettingInput property="styles.background.storedFile.fileCatergory" label="File Catergory" readOnly={readOnly} />
                    </>
                );
            default:
                return (
                    <SettingInput
                        value={background?.color}
                        property='styles.background.color'
                        readOnly={readOnly}
                        label='Color'
                        inputType='color'
                    />
                );
        }
    };

    return (
        <>
            <SettingInput buttonGroupOptions={backgroundTypeOptions} value={background?.type} property='styles.background.type' readOnly={readOnly} inputType='radio' label='Type' />
            {renderBackgroundInput(background?.type)}
            <SizeAndRepeat readOnly={readOnly} backgroundSize={background?.size} backgroundPosition={value?.position} backgroundRepeat={value?.repeat} />
        </>
    );
};

export default BackgroundComponent;
