import { Col, Input, InputNumber, Row, Select } from 'antd';
import React, { FC } from 'react';
import { ColorPicker } from '@/components';
import { IBorderValue } from './interfaces';
import FormItem from '@/designer-components/_settings/components/formItem';
import { InputRow, SettingInput, SettingsRadioGroup } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    model?: any;
    onChange?: (value: IBorderValue) => void;
    renderSettingsItem?: (name: string, label: string, component: React.ReactNode) => React.ReactNode;
}

const BorderComponent: FC<IBorderProps> = ({ model, readOnly }) => {

    const value = model?.border || {};

    const activeBorder = value?.activeBorder || 'all';
    const activeRadius = value?.activeRadius || 'all';
    const hideBorder = model?.hideBorder || false;

    return (
        <>
            <SettingInput label='Hide Border' property='hideBorder' value={value} readOnly={readOnly} type='switch' />
            {!hideBorder && <>
                <SettingInput
                    options={radiusOptions}
                    value={activeRadius}
                    type='radio'
                    property='border.activeRadius'
                    label='Corner'
                    readOnly={readOnly}
                />
                <SettingInput label='Radius' property={`border.radius.${activeRadius}`} readOnly={readOnly} value={value} type='number' />
                <SettingInput label='Side' property={`border.activeBorder`} readOnly={readOnly} value={activeBorder} type='radio' options={borderOptions} />
                <InputRow inputs={[{ label: 'Color', property: `border.border.${activeBorder}.color`, readOnly, value: value?.border?.[activeBorder]?.color, type: 'color' }, { label: 'Width', property: `border.border.${activeBorder}.width`, readOnly, value: value?.border?.[activeBorder]?.width }]} />
                <SettingInput label='Style' property={`border.border.${activeBorder}.style`} readOnly={readOnly} value={value?.border?.[activeBorder]?.style} type='radio' options={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;