import React, { FC, memo } from 'react';
import { alignOptions, fontTypes, fontWeights } from './utils';
import { InputRow } from '@/designer-components/_settings/components/utils';

export interface IFontType {
    readOnly?: boolean;
}



const FontComponent: FC<IFontType> = memo((props) => {
    const { readOnly } = props;
    const commonProps = { hideLabel: true, jsSetting: false, readOnly: readOnly };
    
    return <InputRow inline={true} readOnly={readOnly} inputs={[{
        label: 'Size', propertyName: 'inputStyles.font.size', ...commonProps
    },
    {
        label: 'Weight', propertyName: 'inputStyles.font.weight', inputType: 'dropdown', dropdownOptions: fontWeights, ...commonProps, tooltip: 'Controls text thickness (light, normal, bold, etc.)'
    },
    {
        label: 'Color', propertyName: 'inputStyles.font.color', inputType: 'color', ...commonProps
    },
    {
        label: 'Family', propertyName: 'inputStyles.font.type', inputType: 'dropdown', dropdownOptions: fontTypes, ...commonProps
    },
    {
        label: 'Align', propertyName: 'inputStyles.font.align', inputType: 'radio', buttonGroupOptions: alignOptions, ...commonProps
    }]} />
});

export default FontComponent;