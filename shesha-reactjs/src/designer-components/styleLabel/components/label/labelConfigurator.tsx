import { Button, Radio } from 'antd';
import React, { FC } from 'react';
import { AlignLeftOutlined, AlignRightOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { useStyles } from '../../styles/styles';
import { useSettingsForm } from '@/designer-components/_settings/settingsForm';


interface ILabelProps {
    readOnly?: boolean;
    props?: any;
}


const LabelConfigurator: FC<ILabelProps> = ({ props, readOnly }) => {

    const { model, onValuesChange } = useSettingsForm<any>();
    const { hideLabel, labelAlign } = model;
    const { styles } = useStyles();

    return (
        <div className={styles.flexWrapper} >
            <div className={styles.flexInput}>
                <Radio.Group disabled={readOnly || hideLabel} value={labelAlign} onChange={(e) => {
                    onValuesChange({ labelAlign: e.target.value });
                }}>
                    {[{ value: 'left', icon: <AlignLeftOutlined /> }, { value: 'right', icon: <AlignRightOutlined /> }].map(({ value, icon }) => (
                        <Radio.Button key={value} value={value} title={value}>{icon}</Radio.Button>
                    ))}
                </Radio.Group>
            </div>
            <div className={styles.flexInput}>
                <Button
                    onClick={() => {
                        onValuesChange({ hideLabel: !hideLabel });
                    }}
                    value={hideLabel}
                    disabled={readOnly}
                    className={styles.hidelLabelIcon}
                    icon={hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                />
            </div>
        </div>
    );
};

export default LabelConfigurator;