import React, { FC } from 'react';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { overflowOptions } from './utils';
import { ISizeType } from './interfaces';

const SizeComponent: FC<ISizeType> = ({ model }) => {

    console.log("SIZE - Model:", model)

    const { value, readOnly, noOverflow } = model;

    const commonProps = { hasUnits: true, readOnly, value };

    return (
        <>
            <InputRow inputs={[
                { label: 'Width', property: 'dimensions.width', ...commonProps },
                { label: 'Height', property: 'dimensions.height', ...commonProps }
            ]} />
            <InputRow inputs={[
                { label: 'Min W', property: 'dimensions.minWidth', ...commonProps },
                { label: 'Min H', property: 'dimensions.minHeight', ...commonProps }
            ]} />
            <InputRow inputs={[
                { label: 'Max W', property: 'dimensions.maxWidth', ...commonProps },
                { label: 'Max H', property: 'dimensions.maxHeight', ...commonProps }
            ]} />
            {!noOverflow && <SettingInput label='Overflow' property='dimensions.overflow' type='radio' readOnly={readOnly} value={value} buttonGroupOptions={overflowOptions} />}
        </>
    );
};
export default SizeComponent;
