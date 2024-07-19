import { Col, Input, InputNumber, InputNumberProps, Radio, RadioChangeEvent, Row, Select, Slider } from 'antd';
import React, { useState } from 'react'
import { useStyles } from './styles';
import { BorderBottomOutlined, BorderLeftOutlined, BorderlessTableOutlined, BorderOutlined, BorderRightOutlined, ColumnWidthOutlined, DashOutlined, ExpandOutlined, EyeInvisibleOutlined, EyeOutlined, LinkOutlined, MinusOutlined, RadiusBottomleftOutlined, RadiusBottomrightOutlined, RadiusUpleftOutlined, RadiusUprightOutlined, SmallDashOutlined, UploadOutlined } from '@ant-design/icons';
import { ColorPicker, FileUpload } from '@/components';
import { Upload } from 'antd/lib';
import { evaluateValue, StoredFileProvider, useForm, useFormData, useGlobalState, useSheshaApplication } from '@/index';
import { nanoid } from 'nanoid';
import Icon from '@ant-design/icons/lib/components/Icon';
import TextArea from 'antd/es/input/TextArea';

const { Option } = Select;

const selectAfter = (
    <Select defaultValue="px" >
        <Option value="px">px</Option>
        <Option value="%">%</Option>
        <Option value="em">em</Option>
        <Option value="rem">rem</Option>
        <Option value="vh">vh</Option>
        <Option value="svh">svh</Option>
        <Option value="vw">vw</Option>
        <Option value="svh">svh</Option>
        <Option value="svw">svw</Option>
        <Option value="auto">auto</Option>
    </Select>
);


const SliderComponent = ({ style }) => {
    const [inputValue, setInputValue] = useState(1);


    const onChange: InputNumberProps['onChange'] = (newValue) => {
        setInputValue(newValue as number);
    };

    return (
        <Row>
            <Col span={12}>
                <Slider
                    min={1}
                    max={20}
                    onChange={onChange}
                    value={typeof inputValue === 'number' ? inputValue : 0}
                />
            </Col>
            <Col span={4}>
                <InputNumber
                    min={1}
                    max={20}
                    style={{ margin: '0 16px' }}
                    value={inputValue}
                    onChange={onChange}
                    className={style.input}
                />
            </Col>
        </Row>
    );
}

function SizeComponent() {
    const { styles } = useStyles();
    const { backendUrl } = useSheshaApplication();
    const { formMode } = useForm();
    const onChange = (e: RadioChangeEvent) => {
        console.log(`radio checked:${e.target.value}`);
    };

    return (
        <div>
            <span style={{ fontWeight: 500 }}>Size</span>
            <Row gutter={[8, 8]} style={{ width: 200, fontSize: '11px' }} className={styles.container}>
                <Col className="gutter-row" span={12}>
                    <div>
                        <span>width</span>
                        <Input addonAfter={selectAfter} className={styles.input} property='width' />
                    </div>
                </Col>
                <Col className="gutter-row" span={12}>
                    <div>
                        <span>Height</span>
                        <Input addonAfter={selectAfter} className={styles.input} property='height' />
                    </div>
                </Col>

                <Col className="gutter-row" span={12}>
                    <div>
                        <span>Min W</span>
                        <Input addonAfter={selectAfter} className={styles.input} property='minWidth' />
                    </div>
                </Col>
                <Col className="gutter-row" span={12}>
                    <div>
                        <span>min H</span>
                        <Input addonAfter={selectAfter} className={styles.input} property='minHeight' />
                    </div>
                </Col>
                <Col className="gutter-row" span={12}>
                    <div>
                        <span>Max W</span>
                        <Input addonAfter={selectAfter} className={styles.input} property='maxWidth' />
                    </div>
                </Col>
                <Col className="gutter-row" span={12}>
                    <div>
                        <span>Max H</span>
                        <Input addonAfter={selectAfter} className={styles.input} property='maxHeight' />
                    </div>
                </Col>
                <Col className="gutter-row" span={24}>
                    <span>Overflow
                        <div>
                            <Radio.Group onChange={onChange} defaultValue="a">
                                <Radio.Button value="visible" title="Visible"><EyeOutlined /></Radio.Button>
                                <Radio.Button value="hidden" title="Hidden"><EyeInvisibleOutlined /></Radio.Button>
                                <Radio.Button value="scroll" title="Scroll"><ColumnWidthOutlined /></Radio.Button>
                                <Radio.Button value="auto" title="Auto"><BorderlessTableOutlined /></Radio.Button>
                            </Radio.Group>
                        </div>
                    </span>
                </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ width: 200, fontSize: '11px' }} className={styles.container}>
                <Col className="gutter-row" span={24}>
                    <span>Border
                        <div>
                            <Radio.Group onChange={onChange} defaultValue="a">
                                <Radio.Button value="all" title="all"><ExpandOutlined /></Radio.Button>
                                <Radio.Button value="top-left" title="top-left"><RadiusUpleftOutlined /></Radio.Button>
                                <Radio.Button value="top-right" title="top-right"><RadiusUprightOutlined /></Radio.Button>
                                <Radio.Button value="bottom-left" title="bottom-left"><RadiusBottomleftOutlined /></Radio.Button>
                                <Radio.Button value="bottom-right" title="bottom-right"><RadiusBottomrightOutlined /></Radio.Button>
                            </Radio.Group>
                        </div>
                    </span>
                </Col>
                <Col className="gutter-row" span={24}>
                    <SliderComponent style={styles} />
                </Col>
                <Col className="gutter-row" span={24}>
                    <div>
                        <span>Border
                            <Radio.Group onChange={onChange} defaultValue="all" style={{ width: 'max-content' }}>
                                <Radio.Button value="all"><BorderOutlined /></Radio.Button>
                                <Radio.Button value="top-left"><BorderLeftOutlined /></Radio.Button>
                                <Radio.Button value="top-right"><BorderRightOutlined /></Radio.Button>
                                <Radio.Button value="bottom-left"><BorderBottomOutlined /></Radio.Button>
                                <Radio.Button value="bottom-right"><BorderRightOutlined /></Radio.Button>
                            </Radio.Group>
                        </span>
                    </div>
                </Col>


                <Col className="gutter-row" span={6}>
                    <span>Width</span>
                </Col>
                <Col className="gutter-row" span={18}>
                    <Input addonAfter={selectAfter} className={styles.input} property='borderWidth' style={{ width: 'calc(100%)' }} />
                </Col>
                <Col className="gutter-row" span={6}>
                    <span>Color</span>
                </Col>
                <Col className="gutter-row" span={18}>
                    <div style={{ width: 'calc(100% - 35px)' }}>
                        <ColorPicker allowClear />
                    </div>
                </Col>
                <Col className="gutter-row" span={6}>
                    <span>Style</span>
                </Col>
                <Col className="gutter-row" span={18}>
                    <Radio.Group onChange={onChange} defaultValue="solid" >
                        <Radio.Button value="solid"><MinusOutlined /></Radio.Button>
                        <Radio.Button value="dashed"><DashOutlined /></Radio.Button>
                        <Radio.Button value="dotted"><SmallDashOutlined /></Radio.Button>
                    </Radio.Group>
                </Col>

                <Col className="gutter-row" span={6}>
                    <span>Background</span>
                </Col>
                <Col className="gutter-row" span={18}>
                    <Radio.Group onChange={onChange} defaultValue="solid" >
                        <Radio.Button value="url"><LinkOutlined /></Radio.Button>
                        <Radio.Button value="upload"><UploadOutlined /></Radio.Button>
                        <Radio.Button value="base64">Base64</Radio.Button>
                    </Radio.Group>
                    <Col className="gutter-row" span={6}>
                        <span>URL</span>
                    </Col>
                    <Col className="gutter-row" span={18}>
                        <Input className={styles.input} property='borderWidth' style={{ width: 'calc(100%)' }} />
                    </Col>

                    <Col className="gutter-row" span={6}>
                        <StoredFileProvider
                            onChange={onChange}
                            fileId={nanoid()}
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
                    <Col className="gutter-row" span={6}>
                        <span>Base64</span>
                    </Col>
                    <Col className="gutter-row" span={18}>
                        <TextArea property='base64' className={styles.input} style={{ width: 'calc(100%)' }} />
                    </Col>
                    <Col className="gutter-row" span={18}>
                        <Upload className={styles.input} style={{ width: 'calc(100%)' }} />
                    </Col>
                </Col>
            </Row>
        </div>
    )
};

export default SizeComponent;