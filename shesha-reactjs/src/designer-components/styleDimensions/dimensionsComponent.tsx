import React, { FC } from 'react';
import { InputRow, sizeOptions } from '@/designer-components/_settings/components/utils';
import { overflowOptions } from './utils';
import { IDimensionsType } from './interfaces';
import { SettingInput } from '../_settings/components/settingsInput';

const dimensionInputs = [
    [{ label: 'Width', propertyName: 'styles.dimensions.width' },
    { label: 'Height', propertyName: 'styles.dimensions.height' }],
    [{ label: 'Min Width', propertyName: 'styles.dimensions.minWidth' },
    { label: 'Min Height', propertyName: 'styles.dimensions.minHeight' }],
    [{ label: 'Max Width', propertyName: 'styles.dimensions.maxWidth' },
    { label: 'Max Height', propertyName: 'styles.dimensions.maxHeight' }]
];

const DimensionsComponent: FC<IDimensionsType> = (props) => {

    const { readOnly } = props;

    const commonProps = { hasUnits: true, readOnly };

    return (
        <>
            <SettingInput label="Size" propertyName='size' readOnly={false} inputType='dropdown' tooltip="The size of the element" dropdownOptions={sizeOptions} />
            {dimensionInputs.map((input, index) => (
                <InputRow key={index} inputs={input.map(input => ({ ...input, ...commonProps }))} />
            ))}
            {<SettingInput label='Overflow' propertyName='styles.dimensions.overflow' inputType='radio' readOnly={readOnly} buttonGroupOptions={overflowOptions} />}
        </>
    );
};
export default DimensionsComponent;
