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
        onChange(newValue);
    };

    const { styles } = useStyles();
    return (
        <Col className="gutter-row" span={24} >
            <div className={styles.flexWrapper}>
                <div className={styles.flexInput}>
                    <SettingsFormItem readOnly={readOnly} name="prefix" label="Prefix" jsSetting>
                        <Input value={model?.prefix} readOnly={readOnly} />
                    </SettingsFormItem>
                </div>
                <div className={styles.flexIconPicker}>
                    <SettingsFormItem readOnly={readOnly} name="prefixIcon" label="Prefix Icon">
                        <IconPicker readOnly={readOnly} onIconChange={(_, iconName) => updateValue({ prefixIcon: iconName })} value={model?.prefixIcon} />
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
                    <SettingsFormItem name="suffixIcon" label="Suffix Icon">
                        <IconPicker readOnly={readOnly} onIconChange={(_, iconName) => updateValue({ suffixIcon: iconName })} value={model?.suffixIcon} />
                    </SettingsFormItem>
                </div>
            </div>
        </Col>
    );
};

export default PrefixSuffixComponent;