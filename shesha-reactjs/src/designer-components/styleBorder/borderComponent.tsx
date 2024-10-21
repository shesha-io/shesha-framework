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
    const selectedBorder = useMemo(() => value?.selectedSide || 'all', [value?.selectedSide]);
    const selectedCorner = useMemo(() => value?.selectedCorner || 'all', [value?.selectedCorner]);

    return (
        <>
            <SettingInput label='Hide Border' propertyName='styles.border.hideBorder' value={value} readOnly={readOnly} inputType='switch' />
            {!hideBorder && <>
                <SettingInput
                    buttonGroupOptions={radiusOptions}
                    value={selectedCorner}
                    inputType='radio'
                    propertyName='styles.border.selectedCorner'
                    label='Selected Corner Radius'
                    readOnly={readOnly}
                />
                <SettingInput label='Radius' propertyName={`styles.border.radius.${selectedCorner}`} readOnly={readOnly} />
                <SettingInput label='Selected Border Side' propertyName={`styles.border.selectedSide`} readOnly={readOnly} value={selectedBorder} inputType='radio' buttonGroupOptions={borderOptions} />
                <InputRow inputs={[{ label: 'Color', propertyName: `styles.border.border.${selectedBorder}.color`, readOnly, value: value, inputType: 'color' }, { label: 'Width', propertyName: `styles.border.border.${selectedBorder}.width`, readOnly, value: value }]} />
                <SettingInput label='Style' propertyName={`styles.border.border.${selectedBorder}.style`} readOnly={readOnly} value={value} inputType='radio' buttonGroupOptions={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;