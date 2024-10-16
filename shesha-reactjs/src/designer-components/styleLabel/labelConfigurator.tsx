import { Button } from 'antd';
import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from './styles';
import { labelAlignOptions } from './utils';
import { SettingInput } from '../_settings/components/settingsInput';


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
                <SettingInput label='label Align' hideLabel property='labelAlign' readOnly={value || readOnly} inputType='radio' buttonGroupOptions={labelAlignOptions} jsSetting={false} />
                <SettingInput label="hide Label" hideLabel property='hideLabel' readOnly={readOnly} jsSetting={false}>
                    <Button type='primary' ghost={value ? false : true} size='small' icon={value ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => onChange(!value)} />
                </SettingInput>
            </div>
            <SettingInput label="Label" property='label' readOnly={value || readOnly} />
        </>
    );
};

export default LabelConfiguratorComponent;