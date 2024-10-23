import React, { FC } from 'react';
import { alignOptions, fontTypes, fontWeights } from './utils';
import { InputRow } from '@/designer-components/_settings/components/utils';

export interface IFontType {
    readOnly?: boolean;
}

const inputConfigurations = [
    [
        { label: 'Size', propertyName: 'font.size', valueKey: 'size' },
        { label: 'Weight', propertyName: 'font.weight', inputType: 'dropdown', dropdownOptions: fontWeights, valueKey: 'weight', tooltip: 'Controls text thickness (light, normal, bold, etc.)' }
    ],
    [
        { label: 'Color', propertyName: 'font.color', inputType: 'color', valueKey: 'color' },
        { label: 'Family', propertyName: 'font.type', inputType: 'dropdown', dropdownOptions: fontTypes, valueKey: 'type' }
    ],
    [
        { label: 'Align', propertyName: 'font.align', inputType: 'radio', buttonGroupOptions: alignOptions, valueKey: 'align' }
    ]
];

const FontComponent: FC<IFontType> = (props) => {
    const { readOnly } = props;

    return <>
        {inputConfigurations.map((config, index) => (
            <InputRow
                key={index}
                inputs={config.map(input => ({
                    ...input,
                    readOnly
                }))}
            />
        ))}
    </>
        ;
};

export default FontComponent;