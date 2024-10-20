import { Col } from 'antd';
import React, { FC } from 'react';
import { InputRow } from '@/designer-components/_settings/components/utils';
export interface IPrefixSuffixType {
    readOnly?: boolean;
}

const PrefixSuffixComponent: FC<IPrefixSuffixType> = ({ readOnly }) => {

    return (
        <Col className="gutter-row" span={24} >
            <InputRow inputs={[{ label: 'Prefix', propertyName: 'prefix', readOnly: readOnly }, { inputType: 'iconPicker', propertyName: 'prefixIcon', label: 'Prefix Icon', readOnly }]} />
            <InputRow inputs={[{ label: 'Suffix', propertyName: 'suffix', readOnly: readOnly }, { inputType: 'iconPicker', propertyName: 'suffixIcon', label: 'Suffix Icon', readOnly }]} />
        </Col>
    );
};

export default PrefixSuffixComponent;