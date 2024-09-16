import React, { FC, useEffect } from 'react';
import { IBorderValue } from './interfaces';
import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';



interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    model?: any;
    onChange?: (value: IBorderValue) => void;
    renderSettingsItem?: (name: string, label: string, component: React.ReactNode) => React.ReactNode;
}

const BorderComponent: FC<IBorderProps> = (props) => {

    const { value, readOnly, onChange } = props;
    const hideBorder = value?.hideBorder || false;
    const activeBorder = value?.activeBorder || 'all';
    const activeRadius = value?.activeRadius || 'all';
    console.log('BorderComponent', value, props);
    useEffect(() => {
        if (onChange) {
            onChange({ ...value, activeBorder, activeRadius });
        }

    }, [props]);

    return (
        <>
            <SettingInput label='Hide Border' property='hideBorder' value={value} readOnly={readOnly} type='switch' />
            {!hideBorder && <>
                <SettingInput
                    buttonGroupOptions={radiusOptions}
                    value={activeRadius}
                    type='radio'
                    property='border.activeRadius'
                    label='Corner'
                    readOnly={readOnly}
                />
                <SettingInput label='Radius' property={`border.radius.${activeRadius}`} readOnly={readOnly} value={value} />
                <SettingInput label='Side' property={`border.activeBorder`} readOnly={readOnly} value={activeBorder} type='radio' buttonGroupOptions={borderOptions} />
                <InputRow inputs={[{ label: 'Color', property: `border.border.${activeBorder}.color`, readOnly, value: value, type: 'color' }, { label: 'Width', property: `border.border.${activeBorder}.width`, readOnly, value: value }]} />
                <SettingInput label='Style' property={`border.border.${activeBorder}.style`} readOnly={readOnly} value={value} type='radio' buttonGroupOptions={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;