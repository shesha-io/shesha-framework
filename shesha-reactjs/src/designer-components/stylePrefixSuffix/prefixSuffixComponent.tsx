import { Col } from 'antd';
import React, { FC } from 'react';
import { InputRow } from '@/designer-components/_settings/components/utils';
export interface IPrefixSuffixType {
    readOnly?: boolean;
}

const PrefixSuffixComponent: FC<IPrefixSuffixType> = ({ readOnly }) => {

    return (
        <Col className="gutter-row" span={24} >
            <InputRow inputs={[{ label: 'Prefix', property: 'prefix', readOnly: readOnly }, { type: 'iconPicker', property: 'prefixIcon', label: 'Prefix Icon', readOnly }]} />
            <InputRow inputs={[{ label: 'Suffix', property: 'suffix', readOnly: readOnly }, { type: 'iconPicker', property: 'suffixIcon', label: 'Suffix Icon', readOnly }]} />
        </Col>
    );
};

export default PrefixSuffixComponent;