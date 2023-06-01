import React, { useEffect, useState } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { CodeOutlined, FunctionOutlined, SettingOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, IPropertySetting, PropertySettingMode, useForm } from '../../providers';
import { ConfigurableFormItem } from 'components'
import ComponentsContainer from 'components/formDesigner/componentsContainer';
import { Button } from 'antd';
import { CodeEditor } from 'components/formDesigner/components/codeEditor/codeEditor';
import { nanoid } from 'nanoid';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
    value?: any;
    components?: IConfigurableFormComponent[];
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
    type: 'setting',
    isInput: true,
    isOutput: true,
    name: 'Setting',
    icon: <SettingOutlined />,
    factory: (model: ISettingsComponentProps) => {

        const { formData, setFormData } = useForm();

        const settings: IPropertySetting = formData?.[model.name + '_setting'] ?? {};

        useEffect(() => {
            const propNames = model.name.split('.');
            let val = formData;
            propNames.forEach(p => {
                val = val?.[p];
            });
            if (settings.mode !== 'code' && val !== settings.value) {
                settings.value = val;
                setFormData({values: {[model.name + '_setting']: settings}, mergeValues: true});
            }
        }, [formData]);

        const [ mode, setMode ] = useState<PropertySettingMode>(settings.mode ?? 'value');

        const switchMode = () => {
            const m = mode === 'code' ? 'value' : 'code';
            setSettingsMode(m);
            setMode(m);
        }

        const setSettingsMode = (mode: PropertySettingMode) => {
            settings.mode = mode;

            let obj = {};
            if (mode === 'value') {
                // restore static value
                const propNames = model.name.split('.');
                let i = 0;
                while(i < propNames.length - 1) {
                    obj = obj[propNames[i]] = formData[propNames[i]] ?? {};
                    i++;
                }
                obj[propNames[propNames.length - 1]] = settings.value;
            }
            setFormData({values: {...obj, [model.name + '_setting']: settings}, mergeValues: true});
            setMode(mode);
        };

        const changeCode = (e) => {
            settings.code = e;
            setFormData({values: {[model.name + '_setting']: settings}, mergeValues: true});
        }

        let props: IConfigurableFormComponent = model?.components?.length > 0 ? model?.components[0] : null;
        const components = model?.components?.map(c => ({ ...c, hideLabel: true, readOnly: model?.readOnly }));

        return (
            <ConfigurableFormItem model={props}>
                <div style={{width: 'calc(100% - 32px)'}} >
                    {mode === 'value' &&
                        <ComponentsContainer containerId={model.id} dynamicComponents={components}/>
                    }
                    {mode === 'code' &&
                        <CodeEditor 
                            value={settings.code}
                            onChange={changeCode}
                            mode='dialog'
                            type={'codeEditor'}
                            id={nanoid()}
                            name={model.name + 'Code'}
                            exposedVariables={[
                                {
                                  "name": "value",
                                  "description": "Component current value",
                                  "type": "string | any"
                                },
                                {
                                  "name": "data",
                                  "description": "Selected form values",
                                  "type": "object"
                                },
                                {
                                  "name": "globalState",
                                  "description": "Global state",
                                  "type": "object"
                                },
                                {
                                  "name": "formMode",
                                  "description": "Form mode",
                                  "type": "object"
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
            </ConfigurableFormItem>
        );
    }
};

export default SettingsComponent;
