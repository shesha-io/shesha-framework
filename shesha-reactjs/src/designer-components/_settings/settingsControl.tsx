import React, { FC, ReactElement, useEffect } from 'react';
import { PropertySettingMode } from '../../providers';
import { CodeEditor } from 'components/formDesigner/components/codeEditor/codeEditor';
import { getPropertySettingsFromValue } from './utils';

export type SettingsControlChildrenType = (value: any, onChange:  (...args: any[]) => void, propertyName: string) => ReactElement;

interface ISettingsControlProps {
    id: string;
    propertyName: string;
    value?: any;
    mode: PropertySettingMode;
    onChange?: (value: any) => void;
    readonly children?: SettingsControlChildrenType;
}

export const SettingsControl: FC<ISettingsControlProps> = ({ id, propertyName, value, mode, onChange, children }) => {

    const settings = getPropertySettingsFromValue(value);

    useEffect(() => {
        if (onChange)
            onChange(!!settings._code || mode === 'code' ? { _value: settings._value, _code: settings._code, _mode: mode } : settings._value);
    }, [mode]);

    if (mode === 'code') {
        return <CodeEditor 
            value={settings._code}
            onChange={(value) => {
                if (onChange)
                    onChange(!!value || mode === 'code' ? { _value: settings._value, _code: value, _mode: mode } : settings._value);
            }}
            mode='dialog'
            type='codeEditor'
            language='typescript'
            id={id}
            propertyName={propertyName + 'Code'}
            exposedVariables={[
                { name: "data", description: "Selected form values", type: "object" },
                { name: "contexts", description: "Contexts data", type: "object" },
                //{ name: "value", description: "Component current value", type: "string | any" },
                //{ name: "staticValue", description: "Static value of this setting", type: "any" },
                { name: "globalState", description: "Global state", type: "object" },
                { name: "formMode", description: "Form mode", type: "object" }
            ]}
        />;
    }
    
    return children(settings._value, (value) => {
        if (onChange)
            onChange(!!settings._code ? { _value: value, _code: settings._code, _mode: mode } : value);
    }, propertyName);
};

export default SettingsControl;
