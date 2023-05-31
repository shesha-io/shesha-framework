import React, { useEffect, useState } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { CodeOutlined, FunctionOutlined, SettingOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, useForm } from '../../providers';
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

        const settings = formData?.[model.name + '_setting'] ?? {};

        console.log('value', formData);
        console.log('setting', formData?.[model.name + '_setting']);

        useEffect(() => {
            if (settings.mode !== 'code'
                && formData?.[model.name] !== settings.value
            ) {
                settings.value = formData?.[model.name];
                setFormData({values: {[model.name + '_setting']: settings}, mergeValues: true});
            }
        }, [formData]);

        const [ mode, setMode ] = useState<'value' | 'code'>(settings.mode ?? 'value');

        const switchMode = () => {
            const m = mode === 'code' ? 'value' : 'code';
            setSettingsMode(m);
            setMode(m);
        }

        const setSettingsMode = (mode) => {
            settings.mode = mode;
            setFormData({values: {[model.name + '_setting']: settings}, mergeValues: true});
            setMode(mode);
        };

        const changeCode = (e) => {
            settings.code = e;//e?.target?.value;
            setFormData({values: {[model.name + '_setting']: settings}, mergeValues: true});
        }

        let props: IConfigurableFormComponent = null;

        const components = model?.components?.map(c => {
            props = {...c};
            return { ...c,
                hideLabel: true,
                label: 'test',
                placeholder: 'place',
                readOnly: model?.readOnly };
        });

        const dynamicComponents = components;
        //const dynamicComponents = []];

        return (
            <>
            <ConfigurableFormItem model={props}>
                <div style={{width: 'calc(100% - 32px)'}} >
                    {mode === 'value' &&
                    <ComponentsContainer
                        containerId={model.id}
                        dynamicComponents={dynamicComponents}
                    />
                    }
                    {mode === 'code' &&
                    <CodeEditor value={settings.code} onChange={changeCode} mode='dialog' type={''} id={nanoid()} name={model.name + 'Code'}/>
                    }
                </div>
                <div style={{
                    display: 'inline-block',
                    alignItems: 'center',
                    right: '0',
                    top: '0', 
                    height: '100%',
                    position: 'absolute'}}>
                    <Button
                        icon={ mode === 'value' ? <FunctionOutlined /> : <CodeOutlined />}
                        onClick={switchMode}
                    />
                </div>
            </ConfigurableFormItem>
            </>
        );
    },
    /*settingsFormFactory: (props) => { 
        return <></>;
    },*/
    //validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default SettingsComponent;
