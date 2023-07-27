import React, { FC, ReactElement, useEffect } from 'react';
import { PropertySettingMode } from '../../providers';
import { CodeEditor } from 'components/formDesigner/components/codeEditor/codeEditor';
import { getPropertySettingsFromValue } from './utils';

export type SettingsControlChildrentype = (value: any, onChange:  (...args: any[]) => void, propertyName: string) => ReactElement;

interface ISettingsControlProps {
    id: string;
    propertyName: string;
    value?: any;
    mode: PropertySettingMode;
    onChange?: (value: any) => void;
    readonly children?: SettingsControlChildrentype;
}

export const SettingsControl: FC<ISettingsControlProps> = ({ id, propertyName, value, mode, onChange, children }) => {

    const settings = getPropertySettingsFromValue(value);

    useEffect(() => {
        onChange({ _value: settings._value, _code: settings._code, _mode: mode });
    }, [mode]);

    if (mode === 'code') {
        return <CodeEditor 
            value={settings._code}
            onChange={(value) => onChange({ _value: settings._value, _code: value, _mode: mode })}
            mode='dialog'
            type='codeEditor'
            language='typescript'
            id={id}
            propertyName={propertyName + 'Code'}
            exposedVariables={[
                { name: "value", description: "Component current value", type: "string | any" },
                { name: "data", description: "Selected form values", type: "object" },
                { name: "staticValue", description: "Static value of this setting", type: "any" },
                { name: "globalState", description: "Global state", type: "object" },
                { name: "formMode", description: "Form mode", type: "object" }
            ]}
        />;
    }
    
    return children(settings._value, (value) => {
        onChange(!!settings._code ? { _value: value, _code: settings._code, _mode: mode } : value);
    }, propertyName);
};

export default SettingsControl;
