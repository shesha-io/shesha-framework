import React, { FC } from 'react';
import { IBorderValue } from './interfaces';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';
import { SettingInput } from '../_settings/components/settingsInput';
import { Col, Row } from 'antd';

interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BorderComponent: FC<IBorderProps> = (props) => {

    const { value, readOnly } = props;
    const { selectedSide, selectedCorner } = value;

    return (
        <>

            <InputRow readOnly={readOnly} inputs={[
                { label: 'Select Corner', propertyName: 'inputStyles.border.selectedCorner', jsSetting: false, readOnly: readOnly, inputType: 'radio', buttonGroupOptions: radiusOptions, tooltip: 'Select a corner to which the raduis will be applied' },
                { label: 'Radius', propertyName: `inputStyles.border.radius.${selectedCorner}`, readOnly: readOnly }]} />


            <div style={{ marginTop: 32 }}>
                <InputRow readOnly={readOnly} inputs={[{ label: 'Select Side', jsSetting: false, propertyName: `inputStyles.border.selectedSide`, readOnly: readOnly, inputType: 'radio', buttonGroupOptions: borderOptions, tooltip: 'Select a border side to which the style will be applied' },
                { label: 'Width', propertyName: `inputStyles.border.border.${selectedSide}.width`, readOnly: readOnly }
                ]} />
                <InputRow readOnly={readOnly} inputs={[{ label: 'Color', propertyName: `inputStyles.border.border.${selectedSide}.color`, readOnly: readOnly, inputType: 'color' },
                { label: 'Style', propertyName: `inputStyles.border.border.${selectedSide}.style`, readOnly: readOnly, inputType: 'radio', buttonGroupOptions: styleOptions }]} />
            </div>

        </>
    );
};

export default BorderComponent;