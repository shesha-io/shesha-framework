import { Button, Col, Input, Radio, Row } from 'antd';
import React, { FC } from 'react';
import { AlignLeftOutlined, AlignRightOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { useStyles } from '../../styles/styles';
import { ITextFieldComponentProps } from '@/designer-components/textField/interfaces';


interface ILabelProps {
    onChange?: (value) => void;
    readOnly?: boolean;
    model?: ITextFieldComponentProps;
}


const LabelConfigurator: FC<ILabelProps> = ({ model, readOnly, onChange }) => {

    const { styles } = useStyles();
    const updateValue = (newValue) => {
        const updatedValue = { ...model, ...newValue };
        onChange(updatedValue);
    };
    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }}>
            <Col className="gutter-row" span={24}>
                <SettingsFormItem name="label" label="Label" jsSetting>
                    <Input readOnly={readOnly} />
                </SettingsFormItem>
                <div className={styles.flexWrapper}>
                    <div className={styles.flexInput}>
                        <Radio.Group value={model?.labelAlign} onChange={(e) => updateValue({ labelAlign: e.target.value })}>
                            {[{ value: 'left', icon: <AlignLeftOutlined /> }, { value: 'right', icon: <AlignRightOutlined /> }].map(({ value, icon }) => (
                                <Radio.Button key={value} value={value} title={value}>{icon}</Radio.Button>
                            ))}
                        </Radio.Group>
                    </div>
                    <div className={styles.flexInput}>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                updateValue({ hideLabel: !model?.hideLabel })
                            }}
                            className={styles.hidelLabelIcon}
                            icon={model?.hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        />
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default LabelConfigurator;