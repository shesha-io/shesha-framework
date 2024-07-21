import { Button, Col, Input, Radio, RadioChangeEvent, Row, Select, Tag } from 'antd';
import React, { FC, useState, useEffect } from 'react';
import { useStyles } from './styles';
import { BgColorsOutlined, BoldOutlined, FormatPainterOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { ColorPicker, FileUpload } from '@/components';
import { StoredFileProvider, useForm, useSheshaApplication } from '@/index';
import { nanoid } from 'nanoid';
import TextArea from 'antd/es/input/TextArea';

interface IBackgroundValue {
    type: 'color' | 'url' | 'upload' | 'base64' | 'gradient';
    size?: 'cover' | 'contain' | 'auto';
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    color?: string;
    url?: string;
    fileId?: string;
    base64?: string;
    gradient?: { direction: string, colors: string[] };
}

interface IBackgroundProps {
    onChange?: (value: IBackgroundValue) => void;
    value?: IBackgroundValue;
}

const BackgroundConfigurator: FC<IBackgroundProps> = ({ onChange, value = { type: 'color' } }) => {
    const { styles } = useStyles();
    const { backendUrl } = useSheshaApplication();
    const { formMode } = useForm();
    const [localValue, setLocalValue] = useState<IBackgroundValue>(value);
    const [colors, setColors] = useState<string[]>(value.gradient?.colors || []);

    useEffect(() => {
        setLocalValue(value);
        if (value.type === 'gradient' && value.gradient?.colors) {
            setColors(value.gradient.colors);
        }
    }, [value]);

    const updateValue = (newValue: Partial<IBackgroundValue>) => {
        const updatedValue = { ...localValue, ...newValue };

        setLocalValue(updatedValue);
        onChange?.(updatedValue);
    };

    const onTypeChange = (e: RadioChangeEvent) => {
        updateValue({ type: e.target.value as IBackgroundValue['type'] });
    };

    const addColor = () => {
        const newColors = [...colors, ''];
        setColors(newColors);
        updateValue({ gradient: { ...localValue.gradient, colors: newColors } });
    };

    const updateColor = (color: string, index: number) => {
        const newColors = colors.map((c, i) => (i === index ? color : c));
        setColors(newColors);
        updateValue({ gradient: { ...localValue.gradient, colors: newColors } });
    };

    const removeColor = (index: number) => {
        const newColors = colors.filter((_, i) => i !== index);
        setColors(newColors);
        updateValue({ gradient: { ...localValue.gradient, colors: newColors } });
    };

    const renderBackgroundSizeAndRepeatInput = () => {
        return (
            <Row gutter={[8, 8]} style={{ width: 200, fontSize: '11px' }}>
                <Col className="gutter-row" span={24}>
                    <span>Size</span>
                </Col>
                <Col className="gutter-row" span={24}>
                    <Select
                        defaultValue="auto"
                        style={{ width: 120 }}
                        onChange={(size: any) => updateValue({ size })}
                        options={[
                            { value: 'cover', label: 'Cover' },
                            { value: 'contain', label: 'Contain', },
                            { value: 'auto', label: 'Auto' }
                        ]}
                    />
                </Col>
                <Col className="gutter-row" span={24}>
                    <span>Repeat</span>
                </Col>
                <Col className="gutter-row" span={24}>
                    <Select
                        onChange={(repeat) => updateValue({ repeat })}
                        options={[
                            { label: 'No repeat', value: 'no-repeat' },
                            { label: 'Repeat', value: 'repeat' },
                            { label: 'Repeat X', value: 'repeat-x' },
                            { label: 'Repeat Y', value: 'repeat-y' },
                        ]}
                    />
                </Col>
            </Row>
        );
    }
    const renderBackgroundInput = () => {
        switch (localValue.type) {
            case 'gradient':
                return (
                    <Col className="gutter-row" span={24}>
                        <span>Linear Gradient</span>
                        <Col className="gutter-row" span={12}>
                            <span>Direction</span>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <Input
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={localValue?.gradient?.direction}
                                onChange={(e) => updateValue({ gradient: { ...localValue?.gradient, direction: e.target.value } })}
                            />
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <span>Colors</span>
                        </Col>
                        <Col className="gutter-row" span={24}>
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
                                        <ColorPicker
                                            allowClear
                                            value={color}
                                            onChange={(newColor) => updateColor(newColor.toString(), i)}
                                        />
                                    </Tag>
                                ))}
                            </div>
                            <Button onClick={addColor}>Add color</Button>
                        </Col>
                    </Col>
                );
            case 'url':
                return (
                    <Col className="gutter-row" span={24}>
                        <span>URL</span>
                        <Input
                            className={styles.input}
                            style={{ width: '100%' }}
                            value={localValue.url}
                            onChange={(e) => updateValue({ url: e.target.value })}
                        />
                    </Col>
                );
            case 'upload':
                return (
                    <Col className="gutter-row" span={6}>
                        <StoredFileProvider
                            onChange={(fileId) => updateValue({ fileId })}
                            fileId={localValue.fileId || nanoid()}
                            baseUrl={backendUrl}
                            propertyName={'backgroundImage'}
                            uploadMode={'async'}
                        >
                            <FileUpload
                                isStub={formMode === 'designer'}
                                allowUpload={true}
                                allowDelete={true}
                                allowReplace={true}
                                allowedFileTypes={['png', 'jpg', 'jpeg', 'gif', 'webp']}
                            />
                        </StoredFileProvider>
                    </Col>
                );
            case 'base64':
                return (
                    <Col className="gutter-row" span={24}>
                        <span>Base64</span>
                        <TextArea
                            className={styles.input}
                            style={{ width: '100%' }}
                            value={localValue.base64}
                            onChange={(e) => updateValue({ base64: e.target.value })}
                        />
                    </Col>
                );
            default:
                return (
                    <Col className="gutter-row" span={18}>
                        <span>Color</span>
                        <div style={{ width: '100%' }}>
                            <ColorPicker
                                allowClear
                                value={localValue.color}
                                onChange={(color) => updateValue({ color: color.toString() })}
                            />
                        </div>
                    </Col>
                );
        }
    };

    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }} className={styles.container}>
            <Col className="gutter-row" span={24}>
                <span>Type</span>
            </Col>
            <Col className="gutter-row" span={24}>
                <Radio.Group onChange={onTypeChange} value={localValue.type}>
                    <Radio.Button value="color" title='Background color'><FormatPainterOutlined /></Radio.Button>
                    <Radio.Button value="gradient" title='Gradient background'><BgColorsOutlined /></Radio.Button>
                    <Radio.Button value="url" title='Image url'><LinkOutlined /></Radio.Button>
                    <Radio.Button value="upload" title='Image upload'><UploadOutlined /></Radio.Button>
                    <Radio.Button value="base64" title='Base 64 image'><BoldOutlined />ase64</Radio.Button>
                </Radio.Group>
            </Col>
            {renderBackgroundInput()}
            {value.type !== 'color' && value.type !== 'gradient' && renderBackgroundSizeAndRepeatInput()}
        </Row>
    );
};

export default BackgroundConfigurator;
