import React, { FC } from 'react';
import { InputRow, sizeOptions } from '@/designer-components/_settings/components/utils';
import { overflowOptions } from './utils';
import { IDimensionsType } from './interfaces';
import { SettingInput } from '../_settings/components/settingsInput';

const SizeComponent: FC<IDimensionsType> = (props) => {

    const { value, readOnly, noOverflow, onChange } = props;

    const commonProps = { hasUnits: true, readOnly, value, onChange };

    return (
        <>
            <SettingInput label="Size" propertyName='size' readOnly={false} inputType='dropdown' description="The size of the element" dropdownOptions={sizeOptions} />
            <InputRow inputs={[
                { label: 'Width', propertyName: 'styles.dimensions.width', ...commonProps },
                { label: 'Height', propertyName: 'styles.dimensions.height', ...commonProps }
            ]} />
            <InputRow inputs={[
                { label: 'Min W', propertyName: 'styles.dimensions.minWidth', ...commonProps },
                { label: 'Min H', propertyName: 'styles.dimensions.minHeight', ...commonProps }
            ]} />
            <InputRow inputs={[
                { label: 'Max W', propertyName: 'styles.dimensions.maxWidth', ...commonProps },
                { label: 'Max H', propertyName: 'styles.dimensions.maxHeight', ...commonProps }
            ]} />
            {!noOverflow && <SettingInput label='Overflow' propertyName='styles.dimensions.overflow' inputType='radio' readOnly={readOnly} value={value} buttonGroupOptions={overflowOptions} />}
        </>
    );
};
export default SizeComponent;
