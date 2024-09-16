import { Button, Radio } from 'antd';
import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { SettingInput } from '@/designer-components/_settings/components/utils';
import { labelAlignOptions } from './utils';
import FormItem from '@/designer-components/_settings/components/formItem';


export interface ILabelProps {
    readOnly?: boolean;
    onChange?: any;
    model?: any;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ model, readOnly, onChange }) => {

    const { hideLabel, labelAlign, label } = model;
    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <Radio.Group value={labelAlign} disabled={readOnly} onChange={(e) => onChange({ ...model, labelAlign: e.target.value })}>
                    {labelAlignOptions.map(({ value, icon, title }) => (
                        <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                    ))}
                </Radio.Group>
                <FormItem name='hideLabel' readOnly={readOnly} className={styles.hidelLabelIcon} jsSetting={false}>
                    <Button icon={hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => onChange({ ...model, hideLabel: !hideLabel })} />
                </FormItem>
            </div>
            <SettingInput label="Label" value={label} property='label' readOnly={readOnly || hideLabel} />
        </>
    );
};

export default LabelConfiguratorComponent;