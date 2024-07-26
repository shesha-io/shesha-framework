import { Button, Col, Input, Radio, RadioChangeEvent, Row, Tag } from 'antd';
import { Autocomplete } from '@/components/autocomplete';
import React, { FC, useState, useEffect } from 'react';
import { useStyles } from './styles';
import { BgColorsOutlined, DatabaseOutlined, FormatPainterOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { ColorPicker } from '@/components';
import SizeAndRepeat from './sizeAndRepeat';
import ImageUploader from '../imageUploader';
import { IBackgroundValue } from './interfaces';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { IContainerComponentProps } from '@/interfaces';

interface IBackgroundProps {
    onValuesChange?: (value: IContainerComponentProps) => void;
    value?: IBackgroundValue;
    model?: IContainerComponentProps;
}

const BackgroundConfigurator: FC<IBackgroundProps> = ({ onValuesChange, value, model }) => {
    const { styles } = useStyles();
    const [colors, setColors] = useState<string[]>(value?.gradient?.colors || []);

    const updateValue = (newValue: Partial<IBackgroundValue>) => {
        console.log("VALUE", value, newValue);
        const updatedValue = { ...model, background: { ...value, ...newValue } };

        console.log("UPDATED VALUE", newValue, updatedValue);
        onValuesChange(updatedValue);
    };

    const onTypeChange = (e: RadioChangeEvent) => {
        updateValue({ backgroundType: e.target.value as IBackgroundValue['backgroundType'] });
    };

    const addColor = () => {
        const newColors = [...colors, ''];
        setColors(newColors);
        updateValue({ gradient: { ...value?.gradient, colors: newColors } });
    };

    const updateColor = (color: string, index: number) => {
        const newColors = colors?.map((c, i) => (i === index ? color : c));
        setColors(newColors);
        updateValue({ gradient: { ...value?.gradient, colors: newColors } });
    };

    const removeColor = (index: number) => {
        const newColors = colors?.filter((_, i) => i !== index);
        setColors(newColors);
        updateValue({ gradient: { ...value?.gradient, colors: newColors } });
    };


    const renderBackgroundInput = () => {
        switch (value?.backgroundType) {
            case 'gradient':
                return (
                    <Col className="gutter-row" span={24}>
                        <SettingsFormItem name="background.gradient.direction" label="Direction" jsSetting>
                            <Input
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={value?.gradient?.direction}
                                onChange={(e) => updateValue({ gradient: { ...value?.gradient, direction: e.target.value } })}
                            />
                        </SettingsFormItem>
                        <SettingsFormItem name="background.gradient.colors" label="Colors" jsSetting>
                            <div className={styles.flex}>
                                {colors.map((color, i) => (
                                    <Tag
                                        key={i}
                                        bordered={false}
                                        closable
                                        onClose={(e) => {
                                            e.preventDefault();
                                            removeColor(i);
                                        }}
                                        className={styles.tag}
                                    >
                                        <SettingsFormItem key={color + i} name="background.gradient.colors" label="Colors" jsSetting>
                                            <ColorPicker
                                                allowClear
                                                value={color}
                                                onChange={(newColor) => updateColor(newColor.toString(), i)}
                                            />
                                        </SettingsFormItem>
                                    </Tag>
                                ))}
                            </div>
                        </SettingsFormItem>
                        <Button onClick={addColor}>Add color</Button>
                    </Col>
                );
            case 'url':
                return (
                    <Col className="gutter-row" span={24}>
                        <SettingsFormItem name="background.url" label="URL" jsSetting>
                            <Input
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={value?.url}
                                onChange={(e) => updateValue({ url: e.target.value })}
                            />
                        </SettingsFormItem>
                    </Col>
                );
            case 'upload':
                return (
                    <Col className="gutter-row" span={24}>
                        <SettingsFormItem name="background.file" label="File" jsSetting>
                            <ImageUploader
                                updateValue={updateValue}
                                backgroundImage={value?.file}
                            />
                        </SettingsFormItem>
                    </Col>

                );
            case 'storedFile':
                return (
                    <Col className="gutter-row" span={24}>
                        <SettingsFormItem name="background.storedFile.id" label="File Id" jsSetting>
                            <Input
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={value?.storedFile?.id}
                                onChange={(e) => updateValue({ storedFile: { ...value?.storedFile, id: e.target.value } })} />
                        </SettingsFormItem>
                        <SettingsFormItem name="background.storedFile.ownerType" label="Owner Type" jsSetting>
                            <Autocomplete.Raw
                                dataSourceType="url"
                                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={value?.storedFile?.ownerType}
                                onChange={(e) => updateValue({ storedFile: { ...value?.storedFile, ownerType: e } })} />
                        </SettingsFormItem>

                        <SettingsFormItem name="background.storedFile.ownerId" label="Owner Id" jsSetting>
                            <Input
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={value?.storedFile?.ownerId}
                                onChange={(e) => updateValue({ storedFile: { ...value?.storedFile, ownerId: e.target.value } })} />
                        </SettingsFormItem>

                        <SettingsFormItem name="background.storedFile.fileCatergory" label="File Catergory" jsSetting>
                            <Input
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={value?.storedFile?.fileCategory}
                                onChange={(e) => updateValue({ storedFile: { ...value?.storedFile, fileCategory: e.target.value } })} />
                        </SettingsFormItem>
                    </Col>
                );
            default:
                return (
                    <Col className="gutter-row" span={24}>
                        <SettingsFormItem name="background.color" label="Color" jsSetting>
                            <ColorPicker
                                allowClear
                                value={value?.color}
                                onChange={(color) => updateValue({ color: color.toString() })}
                            />
                        </SettingsFormItem>
                    </Col>
                );
        }
    };

    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }} className={styles.container}>
            <Col className="gutter-row" span={24}>
                <SettingsFormItem name="background.backgroundType" label="Background Type" jsSetting>
                    <Radio.Group onChange={onTypeChange} value={value?.backgroundType}>
                        <Radio.Button value="color" title='Background color'><FormatPainterOutlined /></Radio.Button>
                        <Radio.Button value="gradient" title='Gradient background'><BgColorsOutlined /></Radio.Button>
                        <Radio.Button value="url" title='Image url'><LinkOutlined /></Radio.Button>
                        <Radio.Button value="upload" title='Image upload'><UploadOutlined /></Radio.Button>
                        <Radio.Button value="storedFile" title='Stored File'><DatabaseOutlined /></Radio.Button>
                    </Radio.Group>
                </SettingsFormItem>
            </Col>

            {renderBackgroundInput()}
            <SizeAndRepeat updateValue={updateValue} backgroundSize={value?.size} backgroundPosition={value?.position} backgroundRepeat={value?.repeat} />
        </Row>
    );
};

export default BackgroundConfigurator;
