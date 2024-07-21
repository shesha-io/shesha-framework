import { Button, Col, Flex, Input, Radio, RadioChangeEvent, Row, Tag } from 'antd';
import React, { FC, useState } from 'react'
import { useStyles } from './styles';
import { BgColorsOutlined, BoldOutlined, FormatPainterOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { CollapsiblePanel, ColorPicker, FileUpload } from '@/components';
import { StoredFileProvider, useForm, useSheshaApplication } from '@/index';
import { nanoid } from 'nanoid';
import TextArea from 'antd/es/input/TextArea';

interface IBackgroundValue {
    type: 'color' | 'url' | 'upload' | 'base64' | 'gradient';
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
    const [colors, setColors] = useState<string[]>([]);

    const updateValue = (newValue: Partial<IBackgroundValue>) => {
        const updatedValue = { ...localValue, ...newValue };

        setLocalValue(updatedValue);
        onChange?.(updatedValue);
    };

    const onTypeChange = (e: RadioChangeEvent) => {
        updateValue({ type: e.target.value as IBackgroundValue['type'] });
    };

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
                            <div className={styles.flex}>{
                                colors?.map((_, i) => {
                                return <Tag
                                    bordered={false}
                                    closable
                                    onClose={() => {
                                        setColors(prev => prev.filter((_, index) => index !== i));
                                        updateValue({ gradient: { ...localValue?.gradient, colors: localValue.gradient.colors.filter((_, index) => index !== i) } });
                                    }
                                    }
                                    className={styles.tag}
                                >
                                    <ColorPicker
                                        allowClear
                                        value={localValue.gradient?.colors[i]}
                                        onChange={(color) => updateValue({ gradient: { ...localValue?.gradient, colors: localValue.gradient.colors.map((c, position) => position === i ? color.toString() : c) } })}
                                    />
                                </Tag>
                            })}</div>

                            <Button onClick={() => setColors(prev => [...prev, ''])}>Add color</Button>
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
        <CollapsiblePanel header='Background' className={styles.container} isSimpleDesign accordion={false}>
            <Row gutter={[8, 8]} style={{ width: 200, fontSize: '11px' }}>
                <Col className="gutter-row" span={24}>
                    <span>Type</span>
                </Col>
                <Col className="gutter-row" span={24}>
                    <Radio.Group onChange={onTypeChange} value={localValue.type}>
                        <Radio.Button value="color" title='Background color'><BgColorsOutlined /></Radio.Button>
                        <Radio.Button value="gradient" title='Gradient background'><FormatPainterOutlined /></Radio.Button>
                        <Radio.Button value="url" title='Image url'><LinkOutlined /></Radio.Button>
                        <Radio.Button value="upload" title='Image upload'><UploadOutlined /></Radio.Button>
                        <Radio.Button value="base64" title='Base 64 image'><BoldOutlined />ase64</Radio.Button>
                    </Radio.Group>
                </Col>
                {renderBackgroundInput()}
            </Row>
        </CollapsiblePanel>
    )
};

export default BackgroundConfigurator;