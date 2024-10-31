import React, { FC } from 'react';
import { InputRow, sizeOptions } from '@/designer-components/_settings/components/utils';
import { overflowOptions } from './utils';
import { IDimensionsType } from './interfaces';
import { SettingInput } from '../_settings/components/settingsInput/settingsInput';

const dimensionInputs = [
    [{ label: 'Width', propertyName: 'inputStyles.dimensions.width' },
    { label: 'Height', propertyName: 'inputStyles.dimensions.height' }],
    [{ label: 'Min Width', propertyName: 'inputStyles.dimensions.minWidth' },
    { label: 'Min Height', propertyName: 'inputStyles.dimensions.minHeight' }],
    [{ label: 'Max Width', propertyName: 'inputStyles.dimensions.maxWidth' },
    { label: 'Max Height', propertyName: 'inputStyles.dimensions.maxHeight' }]
];

const DimensionsComponent: FC<IDimensionsType> = (props) => {

    const { readOnly, noOverflow } = props;

    const commonProps = { hasUnits: true, readOnly: readOnly };

    return (
        <>
            <SettingInput label="Size" propertyName='size' readOnly={readOnly} inputType='radio' tooltip="The size of the element" buttonGroupOptions={sizeOptions} />
            {dimensionInputs.map((input, index) => (
                <InputRow readOnly={readOnly} key={index} inputs={input.map(input => ({ ...input, ...commonProps }))} />
            ))}
            {!noOverflow && <SettingInput label='Overflow' propertyName='inputStyles.dimensions.overflow' inputType='radio' readOnly={readOnly} buttonGroupOptions={overflowOptions} />}
        </>
    );
};
export default DimensionsComponent;
