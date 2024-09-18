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
    value?: any;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ model, readOnly, onChange }) => {

    const { labelAlign, label, hideLabel } = model;

    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <FormItem name='labelAlign' jsSetting={false}>
                    <Radio.Group size='small' value={labelAlign} disabled={readOnly} >
                        {labelAlignOptions.map(({ value, icon, title }) => (
                            <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                        ))}
                    </Radio.Group>
                </FormItem>
                <FormItem name='hideLabel' jsSetting={false}>
                    <Button size='small' icon={hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => onChange({ hideLabel: !hideLabel })} />
                </FormItem>
            </div>
            <SettingInput label="Label" value={label} property='label' readOnly={readOnly || hideLabel} />
        </>
    );
};

export default LabelConfiguratorComponent;