import { Button, Radio } from 'antd';
import React, { FC } from 'react';
import { AlignLeftOutlined, AlignRightOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from '../../styles/styles';
import { InputRow, SettingInput, SettingsRadioGroup } from '@/designer-components/_settings/components/utils';
import FormItem from '@/designer-components/_settings/components/formItem';


interface ILabelProps {
    readOnly?: boolean;
    model?: any;
    onChange?: (newValue: any) => void;
}


const LabelConfiguratorComponent: FC<ILabelProps> = ({ model, onChange }) => {

    const { readOnly } = model;
    const { styles } = useStyles();

    console.log("Label mode:::", model)
    return (
        <>
            <div className={styles.flexWrapper} >
                <SettingsRadioGroup label='' value={model.labelAlign} property='labelAlign' options={[{ value: 'left', icon: <AlignLeftOutlined />, title: 'Left' }, { value: 'right', icon: <AlignRightOutlined />, title: 'Right' }]} />
                <FormItem name='hideLabel' label='' jsSetting={false}>
                    <Button
                        value={model.hideLabel}
                        disabled={readOnly}
                        onClick={() => onChange({ ...model, hideLabel: !model.hideLabel })}
                        className={styles.hidelLabelIcon}
                        icon={model.hideLabel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    />
                </FormItem>
            </div>
            <SettingInput label="Label" value={model} property='label' readOnly={readOnly || model.hideLabel} />
        </>

    );
};

export default LabelConfiguratorComponent;