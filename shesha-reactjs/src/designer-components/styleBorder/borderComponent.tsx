import React, { FC, useMemo } from 'react';
import { IBorderValue } from './interfaces';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';
import { SettingInput } from '../_settings/components/settingsInput';



interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BorderComponent: FC<IBorderProps> = (props) => {

    const { value, readOnly } = props;
    const hideBorder = value?.hideBorder || false;
    const activeBorder = useMemo(() => value?.activeBorder || 'all', [value?.activeBorder]);
    const activeRadius = useMemo(() => value?.activeRadius || 'all', [value?.activeRadius]);

    return (
        <>
            <SettingInput label='Hide Border' property='styles.border.hideBorder' value={value} readOnly={readOnly} inputType='switch' />
            {!hideBorder && <>
                <SettingInput
                    buttonGroupOptions={radiusOptions}
                    value={activeRadius}
                    inputType='radio'
                    property='styles.border.activeRadius'
                    label='Corner'
                    readOnly={readOnly}
                />
                <SettingInput label='Radius' property={`styles.border.radius.${activeRadius}`} readOnly={readOnly} />
                <SettingInput label='Side' property={`styles.border.activeBorder`} readOnly={readOnly} value={activeBorder} inputType='radio' buttonGroupOptions={borderOptions} />
                <InputRow inputs={[{ label: 'Color', property: `styles.border.border.${activeBorder}.color`, readOnly, value: value, inputType: 'color' }, { label: 'Width', property: `styles.border.border.${activeBorder}.width`, readOnly, value: value }]} />
                <SettingInput label='Style' property={`styles.border.border.${activeBorder}.style`} readOnly={readOnly} value={value} inputType='radio' buttonGroupOptions={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;