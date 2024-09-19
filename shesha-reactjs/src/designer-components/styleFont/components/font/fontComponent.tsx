import React, { FC } from 'react';
import { IFontValue } from './interfaces';
import { alignOptions, fontTypes, fontWeights } from './utils';
import { InputRow } from '@/designer-components/_settings/components/utils';

export interface IFontType {
    value?: IFontValue;
    readOnly?: boolean;
    model?: any;
    onChange?: (newValue: IFontValue) => void;
}

const FontComponent: FC<IFontType> = (props) => {
    const { value, readOnly } = props;

    return (
        <>
            <InputRow inputs={[
                { label: 'Size', property: 'styles.font.size', readOnly, value: value?.size },
                { label: 'Font Weight', property: 'styles.font.weight', type: 'dropdown', dropdownOptions: fontWeights, readOnly, value: value?.weight }
            ]} />
            <InputRow inputs={[
                { label: 'Color', property: 'styles.font.color', type: 'color', readOnly, value: value?.color },
                { label: 'Family', property: 'styles.font.type', type: 'dropdown', dropdownOptions: fontTypes, readOnly, value: value?.type }
            ]} />
            <InputRow inputs={[
                { label: 'Align', property: 'styles.font.align', type: 'radio', buttonGroupOptions: alignOptions, readOnly, value: value?.align }
            ]} />
        </>
    );
};

export default FontComponent;