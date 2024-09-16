import { Button } from 'antd';
import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { SettingInput } from '@/designer-components/_settings/components/utils';
import { labelalignOptions } from './utils';
import { on } from 'events';


export interface ILabelProps {
    readOnly?: boolean;
    value?: any;
    onChange?: any;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ value, readOnly }) => {

    const {hideLabel, labelAlign, label} = value;
    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <SettingInput label="" property='labelAlign' value={labelAlign} readOnly={readOnly} type='radio' buttonGroupOptions={labelalignOptions} jsSetting={false} />
                <SettingInput label="" icon={hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />} value={hideLabel} property='hideLabel' readOnly={readOnly || hideLabel} type='button' className={styles.hidelLabelIcon} />
            </div>
            <SettingInput label="Label" value={label} property='label' readOnly={readOnly || hideLabel} />
        </>

    );
};

export default LabelConfiguratorComponent;