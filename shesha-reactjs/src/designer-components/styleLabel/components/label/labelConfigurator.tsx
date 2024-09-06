import { Button, Radio } from 'antd';
import React, { FC } from 'react';
import { AlignLeftOutlined, AlignRightOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { SettingInput } from '@/designer-components/_settings/components/utils';


interface ILabelProps {
    readOnly?: boolean;
    model?: any;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ readOnly, model }) => {

    console.log("Label model", model);
    const { value } = model;
    const { hideLabel, labelAlign } = value;
    const { styles } = useStyles();

    return (
        <div className={styles.flexWrapper} >
            <div className={styles.flexInput}>
                <Radio.Group size='small' disabled={readOnly || hideLabel} value={labelAlign}>
                    {[{ value: 'left', icon: <AlignLeftOutlined /> }, { value: 'right', icon: <AlignRightOutlined /> }].map(({ value, icon }) => (
                        <Radio.Button key={value} value={value} title={value}>{icon}</Radio.Button>
                    ))}
                </Radio.Group>
                <SettingInput
                    type='radio'
                    property='labelAlign'
                    label='Label Align'
                    readOnly={readOnly}
                    value={model?.labelAlign}
                    options={[
                        { value: 'left', title: 'Left' },
                        { value: 'right', title: 'Right' },
                    ]}
                />
            </div>
            <div className={styles.flexInput}>
                <Button
                    value={hideLabel}
                    disabled={readOnly}
                    className={styles.hidelLabelIcon}
                    icon={hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                />
            </div>
        </div>
    );
};

export default LabelConfiguratorComponent;