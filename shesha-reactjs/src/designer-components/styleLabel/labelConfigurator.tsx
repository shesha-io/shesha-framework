import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from './styles';
import { labelAlignOptions } from './utils';
import { SettingInput } from '../settingsInput/settingsInput';
import { nanoid } from '@/utils/uuid';


export interface ILabelProps {
    readOnly?: boolean;
    onChange?: (value: any) => void;
    value?: boolean;
}

const LabelConfiguratorComponent: FC<ILabelProps> = ({ value, readOnly }) => {

    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <SettingInput label='label Align' hideLabel propertyName='labelAlign' readOnly={value || readOnly} type='radio' buttonGroupOptions={labelAlignOptions} jsSetting={false} id={nanoid()} />
                <SettingInput id={nanoid()} label="hide Label" hideLabel propertyName='hideLabel' readOnly={readOnly} jsSetting={false} type='button' icon={<EyeOutlined />} iconAlt={<EyeInvisibleOutlined />} />
            </div>
            <SettingInput id={nanoid()} type='text' label="Label" propertyName='label' readOnly={value || readOnly} jsSetting={true} />
        </>
    );
};

export default LabelConfiguratorComponent;