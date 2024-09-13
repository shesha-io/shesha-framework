import { Button } from 'antd';
import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { SettingInput } from '@/designer-components/_settings/components/utils';
import { labelalignOptions } from './utils';
import { on } from 'events';


export interface ILabelProps {
    readOnly?: boolean;
    model?: any;
    value?: any;
    onChange?: any;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ model, onChange, readOnly }) => {

    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <SettingInput label="" property='labelAlign' readOnly={readOnly} type='radio' buttonGroupOptions={labelalignOptions} jsSetting={false} />
                <Button onClick={() => {
                    console.log(`Button ${onChange}`)
                    onChange({ hideLabel: !model.hideLabel })
                }} disabled={readOnly} property='hideLabel' className={styles.hidelLabelIcon} icon={model.hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />} />
            </div>
            <SettingInput label="Label" value={model} property='label' readOnly={readOnly || model.hideLabel} />
        </>

    );
};

export default LabelConfiguratorComponent;