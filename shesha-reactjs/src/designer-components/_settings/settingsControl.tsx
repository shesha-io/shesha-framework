import React, { FC, ReactElement, useMemo } from 'react';
import { PropertySettingMode } from '../../providers';
import { CodeEditor } from '@/components/formDesigner/components/codeEditor/codeEditor';
import { getPropertySettingsFromValue } from './utils';

export type SettingsControlChildrenType = (value: any, onChange:  (...args: any[]) => void, propertyName: string) => ReactElement;

export interface IContextSettingsRef {
    onChange: (...args: any[]) => void;
}

export interface ISwitchModeSettingsRef {
    onChange: (mode: PropertySettingMode) => void;
}


interface ISettingsControlProps {
    id: string;
    propertyName: string;
    readonly?: boolean;
    value?: any;
    mode: PropertySettingMode;
    onChange?: (value: any) => void;
    readonly children?: SettingsControlChildrenType;
    contextRef?: React.MutableRefObject<IContextSettingsRef>;
    modeRef?: React.MutableRefObject<ISwitchModeSettingsRef>;
}

export const SettingsControl: FC<ISettingsControlProps> = ({ id, propertyName, readonly, value, mode, onChange, children, contextRef, modeRef }) => {

    const settings = getPropertySettingsFromValue(value);

    const internalOnSwitchMode = useMemo(() => (mode) => {
        const newValue = !!settings._code || mode === 'code' ? { _value: settings._value, _code: settings._code, _mode: mode } : settings._value;
        if (onChange)
            onChange(newValue);
    }, [settings._code, settings._value, mode]);

    const internalOnChange = useMemo(() => (val) => {
        const newValue = !!settings._code ? { _value: val, _code: settings._code, _mode: mode } : val;
        if (onChange)
            onChange(newValue);
    }, [settings._code, mode]);

    if (contextRef && contextRef.current?.onChange !== internalOnChange)
        contextRef.current = { onChange: internalOnChange };

    if (modeRef && modeRef.current?.onChange !== internalOnSwitchMode)
        modeRef.current = { onChange: internalOnSwitchMode };

    if (mode === 'code') {
        return <CodeEditor
            readOnly={readonly}
            value={settings._code}
            onChange={(val) => {
                const newValue = !!val || mode === 'code' ? { _value: settings._value, _code: val, _mode: mode } : settings._value;
                if (onChange)
                onChange(newValue);
            }}
            mode='dialog'
            language='typescript'
            id={id}
            propertyName={propertyName + 'Code'}
            exposedVariables={[
                { name: "data", description: "Selected form values", type: "object" },
                { name: "contexts", description: "Contexts data", type: "object" },
                { name: "globalState", description: "Global state", type: "object" },
                { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
                { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
                { name: "staticValue", description: "Static value of this setting", type: "any" },
                { name: "getSettingValue", description: "Functiont to get actual setting value", type: "function" },
                { name: "form", description: "Form instance", type: "object" },
                { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
                { name: "moment", description: "moment", type: "object" },
                { name: "http", description: "axiosHttp", type: "object" },
                { name: "message", description: "message framework", type: "object" },
            ]}
        />;
    }

    return children(settings._value, internalOnChange, propertyName);
};

export default SettingsControl;
