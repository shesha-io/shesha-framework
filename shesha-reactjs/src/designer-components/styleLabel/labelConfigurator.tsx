import { Button } from 'antd';
import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from './styles';
import { SettingInput } from '@/designer-components/_settings/components/utils';
import { labelAlignOptions } from './utils';


export interface ILabelProps {
    readOnly?: boolean;
    onChange?: (value: any) => void;
    value?: boolean;
}

const LabelConfiguratorComponent: FC<ILabelProps> = ({ value, readOnly, onChange }) => {

    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <SettingInput label='labelAlign' hideLabel property='labelAlign' readOnly={value || readOnly} type='radio' buttonGroupOptions={labelAlignOptions} jsSetting={false} />
                <SettingInput label="hideLabel" hideLabel property='hideLabel' readOnly={readOnly} jsSetting={false}>
                    <Button type='primary' ghost={value ? false : true} size='small' icon={value ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => onChange(!value)} />
                </SettingInput>
            </div>
            <SettingInput label="Label" property='label' readOnly={value || readOnly} />
        </>
    );
};

export default LabelConfiguratorComponent;