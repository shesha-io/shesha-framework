import { Col, Input } from 'antd';
import React, { FC } from 'react';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { IconPicker } from '@/components';
import { useStyles } from '../../styles/styles';

interface IPrefixSuffixProps {
    onChange?: (value) => void;
    readOnly?: boolean;
    model?: any;
}
const PrefixSuffixComponent: FC<IPrefixSuffixProps> = ({ readOnly, model, onChange }) => {

    const updateValue = (newValue) => {
        const updatedValue = { ...model, ...newValue };
        onChange(updatedValue);
    };

    const { styles } = useStyles();
    return (
        <Col className="gutter-row" span={24}>
            <div className={styles.flexWrapper}>
                <div className={styles.flexInput}>
                    <SettingsFormItem readOnly={readOnly} name="prefix" label="Prefix" jsSetting>
                        <Input value={model?.prefix} readOnly={readOnly} />
                    </SettingsFormItem>
                </div>

                <div className={styles.flexIconPicker}>
                    <SettingsFormItem readOnly={readOnly} name="prefixIcon" label="Prefix Icon" jsSetting>
                        <IconPicker value={model?.prefixIcon} readOnly={readOnly} onChange={(e) => updateValue({ prefixIcon: e })} />
                    </SettingsFormItem>
                </div>
            </div>
            <div className={styles.flexWrapper}>
                <div className={styles.flexInput}>
                    <SettingsFormItem readOnly={readOnly} name="suffix" label="Suffix" jsSetting>
                        <Input value={model?.prefix} readOnly={readOnly} />
                    </SettingsFormItem>
                </div>
                <div className={styles.flexIconPicker}>
                    <SettingsFormItem name="suffixIcon" label="Suffix Icon" jsSetting>
                        <IconPicker value={model?.prefixIcon} readOnly={readOnly} onIconChange={(e) => updateValue({ suffixIcon: e })} />
                    </SettingsFormItem>
                </div>
            </div>
        </Col>
    );
};

export default PrefixSuffixComponent;