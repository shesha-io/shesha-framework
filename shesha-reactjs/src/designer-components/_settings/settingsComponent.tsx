import React, { useMemo } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { SettingOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, useForm } from '../../providers';
import { ComponentsContainer, ConfigurableFormItem } from '@/components';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { Button } from 'antd';
import { getPropertySettingsFromData, getValueFromPropertySettings } from './utils';
import { IContextSettingsRef, ISwitchModeSettingsRef, SettingsControl } from './settingsControl';
import { getSettings } from './settings';
import { getValueByPropertyName, setValueByPropertyName } from '@/utils/object';
import './styles/index.less';
import { useRef } from 'react';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';

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
    Factory: ({ model }) => {

        const { formData } = useForm();

        const { _mode: mode, _code: code } = getPropertySettingsFromData(formData, model.propertyName);

        const internalProps = model?.components?.length > 0 ? model?.components[0] : model;
        const props = Boolean(model?.label) ? model : internalProps;

        const switchMode = () => {
            modeRef.current?.onChange(mode === 'code' ? 'value' : 'code');
        };

        const components = useMemo(() => {
            return model?.components?.map(c => ({ ...c, hideLabel: true, readOnly: model?.readOnly, context: model.id }));
        }, [model?.components, model?.readOnly, model?.id]);

        const ctxRef = useRef<IContextSettingsRef>();
        const modeRef = useRef<ISwitchModeSettingsRef>();

        const label = <span>{props.label}</span>;

        return (
            <ConfigurableFormItem model={{ ...props, label }} className='sha-js-label' >
                {(value, onChange) => {
                    const localValue = getValueFromPropertySettings(value);
                    return (
                    <div className={ mode === 'code' ? 'sha-js-content-code' : 'sha-js-content-js'}>
                        <Button
                            disabled={model.disabled || model.readOnly}
                            shape="round"
                            className='sha-js-switch'
                            type='primary'
                            danger={mode === 'value' && !!code }
                            ghost
                            size='small'
                            onClick={switchMode}
                        >
                            {mode === 'code' ? 'Value' : 'JS'}
                        </Button>
                        <div className='sha-js-content'>
                            <DataContextProvider id={model.id} name={props.propertyName} description={props.propertyName} type={'settings'}
                                initialData={new Promise((resolve) => {
                                    resolve(setValueByPropertyName({}, internalProps?.propertyName, localValue));
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
                                <SettingsControl 
                                    id={model.id}
                                    propertyName={internalProps?.propertyName}
                                    mode={mode}
                                    value={value}
                                    onChange={onChange}
                                    contextRef={ctxRef}
                                    modeRef={modeRef}
                                >
                                    {() =>
                                        <ComponentsContainer containerId={props.id} dynamicComponents={components} />
                                    }
                                </SettingsControl>
                            </DataContextProvider>
                        </div>
                    </div>
                    );
                }}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
    migrator: (m) => m
        .add<ISettingsComponentProps>(0, (prev) => migrateReadOnly(prev))
  ,    
};

export default SettingsComponent;
