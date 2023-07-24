import React, { FC, useState } from 'react';
import { CodeOutlined, FunctionOutlined } from '@ant-design/icons';
import { IPropertySetting, PropertySettingMode } from '../../providers';
import { Button } from 'antd';
import { CodeEditor } from 'components/formDesigner/components/codeEditor/codeEditor';
import { nanoid } from 'nanoid';

export interface ISettingsControlProps {
    children?: React.ReactNode;
    formData?: any;
    onChangeValues: (changedValues: any) => void;
    name?: string;
}

export const SettingsControl: FC<ISettingsControlProps> = (props) => {

    const settings: IPropertySetting = props.formData?.settings?.[props.name] ?? {};
    const [ mode, setMode ] = useState<PropertySettingMode>(settings.mode ?? 'value');

    /*useEffect(() => {
        const propNames = props.name.split('.');
        let val = props.formData;
        propNames.forEach(p => {
            val = val?.[p];
        });
        if (settings.mode !== 'code' && val !== settings.value) {
            settings.value = val;
            props.onChangeValues({settings: {...props.formData?.settings, [props.name]: settings}});
        }
    }, [props.formData]);*/

    const switchMode = () => {
        const m = mode === 'code' ? 'value' : 'code';
        setSettingsMode(m);
        setMode(m);
    };

    const setSettingsMode = (mode: PropertySettingMode) => {
        settings.mode = mode;

        if (mode === 'code') {
            const propNames = props.name.split('.');
            let val = props.formData;
            propNames.forEach(p => {
                val = val?.[p];
            });
            settings.value = val;
        }
        let obj = {};
        if (mode === 'value') {
            // restore static value
            const propNames = props.name.split('.');
            let i = 0;
            while(i < propNames.length - 1) {
                obj = obj[propNames[i]] = props.formData[propNames[i]] ?? {};
                i++;
            }
            obj[propNames[propNames.length - 1]] = settings.value;
        }
        props.onChangeValues({...obj, settings: {...props.formData?.settings, [props.name]: settings}});
        setMode(mode);
    };

    const changeCode = (e) => {
        settings.code = e;
        props.onChangeValues({settings: {...props.formData?.settings, [props.name]: settings}});
    };

    return (
        <>
            <div style={{width: 'calc(100% - 32px)'}} >
                {mode === 'value' && props.children}
                {mode === 'code' &&
                    <CodeEditor 
                        value={settings.code}
                        onChange={changeCode}
                        mode='dialog'
                        type='codeEditor'
                        language='typescript'
                        id={nanoid()}
                        propertyName={props.name + 'Code'}
                        exposedVariables={[
                            {
                              name: "value",
                              description: "Component current value",
                              type: "string | any"
                            },
                            {
                              name: "data",
                              description: "Selected form values",
                              type: "object"
                            },
                            {
                            name: "staticSetting",
                            description: "Static value of this setting",
                            type: "any"
                            },
                            {
                              name: "globalState",
                              description: "Global state",
                              type: "object"
                            },
                            {
                              name: "formMode",
                              description: "Form mode",
                              type: "object"
                            }
                        ]}
                    />
                }
            </div>
            <div style={{
                display: 'inline-block',
                alignItems: 'center',
                right: '0',
                top: '0', 
                height: '100%',
                position: 'absolute'}}
            >
                <Button icon={ mode === 'value' ? <FunctionOutlined /> : <CodeOutlined />} onClick={switchMode} />
            </div>
        </>
    );
};

export default SettingsControl;
