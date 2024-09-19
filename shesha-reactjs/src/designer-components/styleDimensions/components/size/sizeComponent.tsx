import React, { FC } from 'react';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { overflowOptions } from './utils';
import { ISizeType } from './interfaces';

const SizeComponent: FC<ISizeType> = (props) => {

    const { value, readOnly, noOverflow, onChange } = props;

    console.log("SIZE VALUE:::", value);
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
            {!noOverflow && <SettingInput label='Overflow' property='styles.dimensions.overflow' type='radio' readOnly={readOnly} value={value} buttonGroupOptions={overflowOptions} />}
        </>
    );
};
export default SizeComponent;
