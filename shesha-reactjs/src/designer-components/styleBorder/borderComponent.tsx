import React, { FC } from 'react';
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
    const { selectedSide, selectedCorner } = value || { selectedCorner: 'all', selectedSide: 'all' };
    const hideBorder = value?.hideBorder || false;

    return (
        <>
            <SettingInput label='Hide Border' propertyName='border.hideBorder' readOnly={readOnly} inputType='switch' />
            {!hideBorder && <>
                <SettingInput label='Select Corner' propertyName={`border.selectedCorner`} readOnly={readOnly}
                    inputType='radio' buttonGroupOptions={radiusOptions} tooltip='Select a corner to which the raduis will be applied' />
                <SettingInput label='Radius' propertyName={`border.radius.${selectedCorner}`} readOnly={readOnly} />
                <SettingInput label='Select Side' propertyName={`border.selectedSide`} readOnly={readOnly}
                    inputType='radio' buttonGroupOptions={borderOptions} tooltip='Select a border side to which the style will be applied' />
                <InputRow inputs={[{ label: 'Color', propertyName: `border.border.${selectedSide}.color`, readOnly, inputType: 'color' }, { label: 'Width', propertyName: `border.border.${selectedSide}.width`, readOnly }]} />
                <SettingInput label='Style' propertyName={`border.border.${selectedSide}.style`} readOnly={readOnly} inputType='radio' buttonGroupOptions={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;