import React from 'react';

import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { SettingOutlined } from "@ant-design/icons";
import { SettingInput } from '../settingsInput/settingsInput';
import { getWidth } from '../settingsInput/utils';
import { evaluateString, useShaFormInstance } from '@/index';
import { useStyles } from '../inputComponent/styles';
import { ISettingsInputProps } from '../settingsInput/interfaces';

export interface ISettingsInputRowProps extends Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'>, IInputRowProps {

}

export interface IInputRowProps {
    inputs: Array<ISettingsInputProps>;
    readOnly?: boolean;
    inline?: boolean;
    children?: React.ReactNode;
    hidden?: boolean;
}

export const InputRow: React.FC<IInputRowProps> = ({ inputs, readOnly, children, inline, hidden }) => {
    const { styles } = useStyles();
    const { formData } = useShaFormInstance();

    const isHidden = typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden;
    return isHidden || inputs.length === 0 ? null : <div className={inline ? styles.inlineInputs : styles.rowInputs}>
        {inputs.map((props, i) => {
            const { type } = props;
            const isHidden = typeof props.hidden === 'string' ? evaluateString(props.hidden, { data: formData }) : props.hidden;

            const width = getWidth(type, props.width);

            return (
                <SettingInput key={i + props.label}
                    {...props}
                    hidden={isHidden as boolean}
                    readOnly={readOnly}
                    inline={inline}
                    width={width} />
            );
        })}
        {children}
    </div>;
};

const SettingsInputRow: IToolboxComponent<ISettingsInputRowProps> = {
    type: 'settingsInputRow',
    isInput: true,
    isOutput: true,
    name: 'SettingsInputRow',
    icon: <SettingOutlined />,
    Factory: ({ model }) => {
        return model.hidden ? null : (
            <InputRow readOnly={model.readOnly} {...model} />
        );
    }
};

export default SettingsInputRow;
