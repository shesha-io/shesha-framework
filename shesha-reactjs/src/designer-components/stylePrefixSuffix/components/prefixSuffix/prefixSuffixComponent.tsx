import { Col, Input } from 'antd';
import React, { FC } from 'react';
import FormItem from '@/designer-components/_settings/components/formItem';
import { IconPicker } from '@/components';
import { useStyles } from '../../styles/styles';

export interface IPrefixSuffixType {
    onChange?: (value) => void;
    readOnly?: boolean;
    model?: any;
}

const PrefixSuffixComponent: FC<IPrefixSuffixType> = ({ readOnly, model, onChange }) => {

    const updateValue = (newValue) => {
        onChange(newValue);
    };

    const { styles } = useStyles();
    return (
        <Col className="gutter-row" span={24} >
            <div className={styles.flexWrapper}>
                <div className={styles.flexInput}>
                    <FormItem name="prefix" label="Prefix" jsSetting>
                        <Input value={model?.prefix} readOnly={readOnly} />
                    </FormItem>
                </div>
                <div className={styles.flexIconPicker}>
                    <FormItem name="prefixIcon" label="Prefix Icon" jsSetting>
                        <IconPicker selectBtnSize='small' readOnly={readOnly} onIconChange={(_, iconName) => updateValue({ prefixIcon: iconName })} value={model?.prefixIcon} />
                    </FormItem>
                </div>
            </div>
            <div className={styles.flexWrapper}>
                <div className={styles.flexInput}>
                    <FormItem name="suffix" label="Suffix" jsSetting>
                        <Input value={model?.prefix} readOnly={readOnly} />
                    </FormItem>
                </div>
                <div className={styles.flexIconPicker}>
                    <FormItem name="suffixIcon" label="Suffix Icon" jsSetting>
                        <IconPicker selectBtnSize='small' readOnly={readOnly} onIconChange={(_, iconName) => updateValue({ suffixIcon: iconName })} value={model?.suffixIcon} />
                    </FormItem>
                </div>
            </div>
        </Col>
    );
};

export default PrefixSuffixComponent;