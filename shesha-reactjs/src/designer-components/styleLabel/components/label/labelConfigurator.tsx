import { Button, Radio } from 'antd';
import React, { FC } from 'react';
import { AlignLeftOutlined, AlignRightOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';


interface ILabelProps {
    readOnly?: boolean;
    value?: any;
    onChange?: (value) => void;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ readOnly, value, onChange }) => {

    const { hideLabel, labelAlign } = value;
    const { styles } = useStyles();

    return (
        <div className={styles.flexWrapper} >
            <div className={styles.flexInput}>
                <Radio.Group size='small' disabled={readOnly || hideLabel} value={labelAlign} onChange={(e) => {
                    onChange({ labelAlign: e.target.value });
                }}>
                    {[{ value: 'left', icon: <AlignLeftOutlined /> }, { value: 'right', icon: <AlignRightOutlined /> }].map(({ value, icon }) => (
                        <Radio.Button key={value} value={value} title={value}>{icon}</Radio.Button>
                    ))}
                </Radio.Group>
            </div>
            <div className={styles.flexInput}>
                <Button
                    onClick={() => {
                        onChange({ hideLabel: !hideLabel });
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

export default LabelConfiguratorComponent;