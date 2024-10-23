import React, { FC } from 'react';
import { IFontValue } from './interfaces';
import { alignOptions, fontTypes, fontWeights } from './utils';
import { InputRow } from '@/designer-components/_settings/components/utils';

export interface IFontType {
    value?: IFontValue;
    readOnly?: boolean;
}

const inputConfigurations = [
    [
        { label: 'Size', propertyName: 'styles.font.size', valueKey: 'size' },
        { label: 'Weight', propertyName: 'styles.font.weight', inputType: 'dropdown', dropdownOptions: fontWeights, valueKey: 'weight' }
    ],
    [
        { label: 'Color', propertyName: 'styles.font.color', inputType: 'color', valueKey: 'color' },
        { label: 'Family', propertyName: 'styles.font.type', inputType: 'dropdown', dropdownOptions: fontTypes, valueKey: 'type' }
    ],
    [
        { label: 'Align', propertyName: 'styles.font.align', inputType: 'radio', buttonGroupOptions: alignOptions, valueKey: 'align' }
    ]
];

const FontComponent: FC<IFontType> = (props) => {
    const { value, readOnly } = props;

    return <>
        {inputConfigurations.map((config, index) => (
            <InputRow
                key={index}
                inputs={config.map(input => ({
                    ...input,
                    readOnly,
                    value: value?.[input.valueKey]
                }))}
            />
        ))}
    </>
        ;
};

export default FontComponent;