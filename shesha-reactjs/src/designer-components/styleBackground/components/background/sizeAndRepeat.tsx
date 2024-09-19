import React, { FC, useEffect, useState } from 'react';
import { IBackgroundValue } from './interfaces';
import { repeatOptions } from './utils';
import { IDropdownOption, SettingInput } from '@/designer-components/_settings/components/utils';

type SizeAndRepeatProps = {
    backgroundSize: IBackgroundValue['size'];
    backgroundPosition: IBackgroundValue['position'];
    backgroundRepeat: IBackgroundValue['repeat'];
    readOnly?: boolean;
};

const SizeAndRepeat: FC<SizeAndRepeatProps> = ({ backgroundSize, backgroundPosition, backgroundRepeat, readOnly }) => {
    const defaultSizes = ['cover', 'contain', 'auto'];
    const defaultPositions = ['center', 'top', 'left', 'right', 'bottom', 'top left', 'top right', 'bottom left', 'bottom right'];

    const [sizes, setSizes] = useState<string[]>([...defaultSizes]);
    const [positions, setPositions] = useState<string[]>([...defaultPositions]);

    useEffect(() => {
        if (backgroundSize && !sizes.includes(backgroundSize)) {
            setSizes(() => [...defaultSizes, backgroundSize]);
        }
        if (backgroundPosition && !positions.includes(backgroundPosition)) {
            setPositions(() => [...defaultPositions, backgroundPosition]);
        }
    }, [backgroundSize, backgroundPosition]);

    return (
        <>
            {[{
                name: 'size',
                label: 'Size',
                value: backgroundSize,
                options: sizes,
                property: 'size',
            },
            {
                name: 'position',
                label: 'Position',
                value: backgroundPosition,
                options: positions,
                property: 'position',
            },
            {
                name: 'repeat',
                label: 'Repeat',
                value: backgroundRepeat,
                options: repeatOptions,
            }].map(({ name, label, value, options }) => (
                <SettingInput key={name} dropdownOptions={options as IDropdownOption[]} value={value} label={label} property={`styles.background.${name}`} readOnly={readOnly} type='customDropdown' />
            ))}
        </>
    );
};

export default SizeAndRepeat;