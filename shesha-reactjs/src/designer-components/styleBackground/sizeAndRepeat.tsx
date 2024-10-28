import React, { FC } from 'react';
import { positionOptions, repeatOptions, sizeOptions } from './utils';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { SettingInput } from '../_settings/components/settingsInput';

type SizeAndRepeatProps = {
    readOnly?: boolean;
};

const SizeAndRepeat: FC<SizeAndRepeatProps> = ({ readOnly }) => {

    return (
        <>
            <InputRow readOnly={readOnly} inputs={[{
                propertyName: 'size',
                label: 'Size',
                inputType: 'customDropdown',
                dropdownOptions: sizeOptions,
                readOnly: readOnly
            },
            {
                propertyName: 'position',
                label: 'Position',
                inputType: 'customDropdown',
                dropdownOptions: positionOptions,
                readOnly: readOnly
            }]} />
            <SettingInput
                label="Repeat"
                buttonGroupOptions={repeatOptions}
                inputType='radio'
                propertyName={"inputStyles.background.repeat"}
                readOnly={readOnly} />
        </>
    );
};

export default SizeAndRepeat;