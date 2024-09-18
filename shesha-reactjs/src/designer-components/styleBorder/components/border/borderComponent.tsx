import React, { FC } from 'react';
import { IBorderValue } from './interfaces';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';



interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BorderComponent: FC<IBorderProps> = (props) => {

    const { value, readOnly } = props;
    const hideBorder = value?.hideBorder || false;
    const activeBorder = value?.activeBorder || 'all';
    const activeRadius = value?.activeRadius || 'all';

    console.log("BORDER VALUE:::", value);

    return (
        <>
            <SettingInput label='Hide Border' property='border.hideBorder' value={value} readOnly={readOnly} type='switch' />
            {!hideBorder && <>
                <SettingInput
                    buttonGroupOptions={radiusOptions}
                    value={activeRadius}
                    type='radio'
                    property='border.activeRadius'
                    label='Corner'
                    readOnly={readOnly}
                />
                <SettingInput label='Radius' property={`border.radius.${activeRadius}`} readOnly={readOnly} />
                <SettingInput label='Side' property={`border.activeBorder`} readOnly={readOnly} value={activeBorder} type='radio' buttonGroupOptions={borderOptions} />
                <InputRow inputs={[{ label: 'Color', property: `border.border.${activeBorder}.color`, readOnly, value: value, type: 'color' }, { label: 'Width', property: `border.border.${activeBorder}.width`, readOnly, value: value }]} />
                <SettingInput label='Style' property={`border.border.${activeBorder}.style`} readOnly={readOnly} value={value} type='radio' buttonGroupOptions={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;