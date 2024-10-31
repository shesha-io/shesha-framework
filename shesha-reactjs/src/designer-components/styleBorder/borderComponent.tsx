import React, { FC } from 'react';
import { IBorderValue } from './interfaces';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BorderComponent: FC<IBorderProps> = (props) => {

    const { value, readOnly } = props;
    const { selectedSide, selectedCorner } = value;

    const commonProps = {
        readOnly: readOnly || value.hideBorder,
        inline: true,
        jsSetting: false,
        hideLabel: true
    };

    return (
        <>
            <InputRow readOnly={readOnly} inline={true} inputs={[
                { ...commonProps, label: 'Border', propertyName: 'inputStyles.border.hideBorder', inputType: 'button', readOnly: readOnly, icon: value.hideBorder ? <EyeInvisibleOutlined /> : <EyeOutlined /> },
                { ...commonProps, label: 'Select Side', jsSetting: false, propertyName: `inputStyles.border.selectedSide`, inputType: 'radio', buttonGroupOptions: borderOptions, tooltip: 'Select a border side to which the style will be applied' },
                { ...commonProps, label: 'Width', jsSetting: false, propertyName: `inputStyles.border.border.${selectedSide}.width` },
                { ...commonProps, label: 'Style', width: 60, jsSetting: false, propertyName: `inputStyles.border.border.${selectedSide}.style`, inputType: 'dropdown', dropdownOptions: styleOptions },
                { ...commonProps, label: 'Color', jsSetting: false, propertyName: `inputStyles.border.border.${selectedSide}.color`, inputType: 'color' }]}
            />

            <InputRow readOnly={readOnly} inline={true} inputs={[
                { ...commonProps, readOnly: readOnly, label: 'Corner Radius', propertyName: 'inputStyles.border.selectedCorner', hideLabel: false, inputType: 'radio', buttonGroupOptions: radiusOptions, tooltip: 'Select a corner to which the raduis will be applied' },
                { ...commonProps, readOnly: readOnly, label: 'Radius', propertyName: `inputStyles.border.radius.${selectedCorner}` }]} />
        </>
    );
};

export default BorderComponent;