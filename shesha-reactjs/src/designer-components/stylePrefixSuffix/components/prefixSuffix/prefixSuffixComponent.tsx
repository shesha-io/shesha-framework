import { Col, Input } from 'antd';
import React, { FC } from 'react';
import FormItem from '@/designer-components/_settings/components/formItem';
import { IconPicker } from '@/components';
import { useStyles } from '../../styles/styles';
import { InputRow } from '@/designer-components/_settings/components/utils';

export interface IPrefixSuffixType {
    onChange?: (value) => void;
    readOnly?: boolean;
    model?: any;
}

const PrefixSuffixComponent: FC<IPrefixSuffixType> = ({ readOnly, model }) => {

    return (
        <Col className="gutter-row" span={24} >
            <InputRow inputs={[{ label: 'Prefix', property: 'prefix', readOnly: readOnly, value: model?.suffix }, { type: 'iconPicker', property: 'prefixIcon', label: 'Prefix Icon', readOnly }]} />
            <InputRow inputs={[{ label: 'Suffix', property: 'suffix', readOnly: readOnly, value: model?.suffixIcon }, { type: 'iconPicker', property: 'suffixIcon', label: 'Suffix Icon', readOnly }]} />
        </Col>
    );
};

export default PrefixSuffixComponent;