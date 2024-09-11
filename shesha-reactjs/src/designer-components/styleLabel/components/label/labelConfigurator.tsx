import { Button } from 'antd';
import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { SettingInput } from '@/designer-components/_settings/components/utils';
import { labelalignOptions } from './utils';


export interface ILabelProps {
    readOnly?: boolean;
    model?: any;
    value?: any;
    onChange?: (newValue: any) => void;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ model, onChange, readOnly }) => {

    console.log("LabelConfiguratorComponent::", model, onChange, readOnly);
    
    const { styles } = useStyles();

    return (
        <>
            <div className={styles.flexWrapper} >
                <SettingInput label="" value={model} property='labelAlign' readOnly={readOnly} type='radio' buttonGroupOptions={labelalignOptions} jsSetting={false} />
                <Button
                    value={model.hideLabel}
                    disabled={readOnly}
                    onClick={() => {
                        console.log("Hide Label::", model.hideLabel);
                        onChange({ hideLabel: !model.hideLabel })
                    }}
                    className={styles.hidelLabelIcon}
                    size='small'
                    icon={model.hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                />
            </div>
            <SettingInput label="Label" value={model} property='label' readOnly={readOnly || model.hideLabel} />
        </>

    );
};

export default LabelConfiguratorComponent;