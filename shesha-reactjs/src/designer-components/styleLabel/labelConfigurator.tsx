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
    label: string | React.ReactNode;
}

const LabelConfiguratorComponent: FC<ILabelProps> = ({ value, readOnly, label }) => {

    const { styles } = useStyles();

    return (
        <>
            <div className={!value ? styles.flexWrapper : ''} >
                <SettingInput label={`${label} Align`} hideLabel propertyName='labelAlign' readOnly={readOnly} type='radio' hidden={value} buttonGroupOptions={labelAlignOptions} jsSetting={false} id={nanoid()} />
                <SettingInput id={nanoid()} label={`Hide ${label}`} hideLabel={!value} propertyName='hideLabel' readOnly={readOnly} jsSetting={false} type='button' icon={<EyeOutlined />} iconAlt={<EyeInvisibleOutlined />} />
            </div>
            <SettingInput id={nanoid()} type='text' label={label as string} propertyName='label' readOnly={readOnly} jsSetting={!value} hidden={value} />
        </>
    );
};

export default LabelConfiguratorComponent;