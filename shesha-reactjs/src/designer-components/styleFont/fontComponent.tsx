import React, { FC } from 'react';
import { IFontValue } from './interfaces';
import { alignOptions, fontTypes, fontWeights } from './utils';
import { InputRow, removeEmptyComponent } from '@/designer-components/_settings/components/utils';

export interface IFontType {
    value?: IFontValue;
    readOnly?: boolean;
}

const inputConfigurations = [
    [
        { label: 'Size', property: 'styles.font.size', valueKey: 'size' },
        { label: 'Weight', property: 'styles.font.weight', inputType: 'dropdown', dropdownOptions: fontWeights, valueKey: 'weight' }
    ],
    [
        { label: 'Color', property: 'styles.font.color', inputType: 'color', valueKey: 'color' },
        { label: 'Family', property: 'styles.font.type', inputType: 'dropdown', dropdownOptions: fontTypes, valueKey: 'type' }
    ],
    [
        { label: 'Align', property: 'styles.font.align', inputType: 'radio', buttonGroupOptions: alignOptions, valueKey: 'align' }
    ]
];

const FontComponent: FC<IFontType> = (props) => {
    const { value, readOnly } = props;

    return removeEmptyComponent(
        <>
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
    );
};

export default FontComponent;