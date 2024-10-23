import React, { FC, useState } from 'react';
import { IBorderValue } from './interfaces';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { borderOptions, radiusOptions, styleOptions } from './utils';
import { SettingInput } from '../_settings/components/settingsInput';
import { Radio } from 'antd';



interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    onChange?: (value: any) => void;
}

const BorderComponent: FC<IBorderProps> = (props) => {
    const [selectedBorder, setSelectedBorder] = useState('all');
    const [selectedCorner, setSelectedCorner] = useState('all');

    const { value, readOnly } = props;
    const hideBorder = value?.hideBorder || false;

    const radioButtons = ({ buttonGroupOptions, onChange }) => <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={(e) => onChange(e.target.value)} size='small' disabled={readOnly}>
        {buttonGroupOptions.map(({ value, icon, title }) => (
            <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
        ))}
    </Radio.Group>;

    return (
        <>
            <SettingInput label='Hide Border' propertyName='styles.border.hideBorder' value={value} readOnly={readOnly} inputType='switch' />
            {!hideBorder && <>
                {radioButtons({ buttonGroupOptions: radiusOptions, onChange: setSelectedCorner })}
                <SettingInput label='Radius' propertyName={`styles.border.radius.${selectedCorner}`} readOnly={readOnly} />
                {radioButtons({ buttonGroupOptions: borderOptions, onChange: setSelectedBorder })}
                <InputRow inputs={[{ label: 'Color', propertyName: `styles.border.border.${selectedBorder}.color`, readOnly, value: value, inputType: 'color' }, { label: 'Width', propertyName: `styles.border.border.${selectedBorder}.width`, readOnly, value: value }]} />
                <SettingInput label='Style' propertyName={`styles.border.border.${selectedBorder}.style`} readOnly={readOnly} value={value} inputType='radio' buttonGroupOptions={styleOptions} />
            </>}
        </>
    );
};

export default BorderComponent;