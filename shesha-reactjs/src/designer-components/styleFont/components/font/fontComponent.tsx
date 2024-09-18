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

    console.log("FONT VALUE:::", value);

    return (
        <>
            <InputRow inputs={[
                { label: 'Size', property: 'font.size', readOnly, value },
                { label: 'Font Weight', property: 'font.weight', type: 'dropdown', dropdownOptions: fontWeights, readOnly, value }
            ]} />
            <InputRow inputs={[
                { label: 'Color', property: 'font.color', type: 'color', readOnly, value },
                { label: 'Family', property: 'font.type', type: 'dropdown', dropdownOptions: fontTypes, readOnly, value }
            ]} />
            <InputRow inputs={[
                { label: 'Align', property: 'font.align', type: 'radio', buttonGroupOptions: alignOptions, readOnly, value }
            ]} />
        </>
    );
};

export default FontComponent;