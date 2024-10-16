import React, { FC } from 'react';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { overflowOptions } from './utils';
import { IDimensionsType } from './interfaces';
import { SettingInput } from '../_settings/components/settingsInput';

const SizeComponent: FC<IDimensionsType> = (props) => {

    const { value, readOnly, noOverflow, onChange } = props;

    const commonProps = { hasUnits: true, readOnly, value, onChange };

    return (
        <>
            <InputRow inputs={[
                { label: 'Width', property: 'styles.dimensions.width', ...commonProps },
                { label: 'Height', property: 'styles.dimensions.height', ...commonProps }
            ]} />
            <InputRow inputs={[
                { label: 'Min W', property: 'styles.dimensions.minWidth', ...commonProps },
                { label: 'Min H', property: 'styles.dimensions.minHeight', ...commonProps }
            ]} />
            <InputRow inputs={[
                { label: 'Max W', property: 'styles.dimensions.maxWidth', ...commonProps },
                { label: 'Max H', property: 'styles.dimensions.maxHeight', ...commonProps }
            ]} />
            {!noOverflow && <SettingInput label='Overflow' property='styles.dimensions.overflow' inputType='radio' readOnly={readOnly} value={value} buttonGroupOptions={overflowOptions} />}
        </>
    );
};
export default SizeComponent;
