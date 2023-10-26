import React, { useMemo, useState } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { SettingOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, PropertySettingMode, useForm } from '../../providers';
import { ComponentsContainer, ConfigurableFormItem } from 'components';
import { DataContextProvider } from 'providers/dataContextProvider';
import { Button } from 'antd';
import { getPropertySettingsFromData, getValueFromPropertySettings } from './utils';
import { IContextSettingsRef, SettingsControl } from './settingsControl';
import { getSettings } from './settings';
import { getValueByPropertyName, setValueByPropertyName } from 'utils/object';
import './styles/index.less';
import { useRef } from 'react';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
    components?: IConfigurableFormComponent[];
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
    type: 'setting',
    isInput: true,
    isOutput: true,
    name: 'Setting',
    isHidden: true,
    icon: <SettingOutlined />,
    factory: (model: ISettingsComponentProps) => {

        const { formData } = useForm();

        const initSettings = getPropertySettingsFromData(formData, model.propertyName);

        const [mode, setMode] = useState<PropertySettingMode>(initSettings._mode ?? 'value');

        const internalProps = model?.components?.length > 0 ? model?.components[0] : model;
        const props = Boolean(model?.label) ? model : internalProps;

        const switchMode = () => {
            setMode(mode === 'code' ? 'value' : 'code');
        };

        const components = useMemo(() => {
            return model?.components?.map(c => ({ ...c, hideLabel: true, readOnly: model?.readOnly, context: model.id }));
        }, [model?.components, model?.readOnly, model?.id]);

        const ctxRef = useRef<IContextSettingsRef>();

        console.log('settings rendering');

        return (
            <ConfigurableFormItem model={{ ...props, label: props.label, }} className='sha-js-label' >
                {(value, onChange) => {
                    const localValue = getValueFromPropertySettings(value);
                    return (
                    <div className={ mode === 'code' ? 'sha-js-content-code' : 'sha-js-content-js'}>
                        <Button
                            disabled={model.disabled || model.readOnly}
                            shape="round"
                            className='sha-js-switch'
                            type='primary'
                            ghost
                            size='small'
                            onClick={switchMode}
                        >
                            {mode === 'code' ? 'Value' : 'JS'}
                        </Button>
                        <DataContextProvider id={model.id} name={props.componentName} description={props.label.toString()} type={'settings'}
                            initialData={new Promise((resolve) => {
                                resolve(setValueByPropertyName({}, internalProps?.propertyName, value));
                            })}
                            dynamicData={
                                internalProps?.propertyName && localValue
                                    ? setValueByPropertyName({}, internalProps?.propertyName, localValue)
                                    : null
                            }
                            onChangeData={(v) => {
                                if (v && ctxRef.current?.onChange)
                                    ctxRef.current?.onChange(getValueByPropertyName(v, internalProps?.propertyName));
                            }}
                        >
                            <SettingsControl id={model.id} propertyName={internalProps?.propertyName} mode={mode} value={value} onChange={onChange} contextRef={ctxRef}>
                                {() =>
                                    <ComponentsContainer containerId={props.id} dynamicComponents={components} />
                                }
                            </SettingsControl>
                        </DataContextProvider>
                    </div>
                    );
                }}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default SettingsComponent;
