import React, { useMemo } from 'react';
import SettingsControl from './settingsControl';
import { ConfigurableFormItem } from '@/components';
import { getSettings } from './settings';
import { IConfigurableFormComponent } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { SettingOutlined } from '@ant-design/icons';
import { SettingsControlRenderer } from './settingsControlRenderer';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
    sourceComponent?: IConfigurableFormComponent;
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
    type: 'setting',
    isInput: true,
    isOutput: true,
    name: 'Setting',
    isHidden: false,
    icon: <SettingOutlined />,
    Factory: ({ model }) => {
        const component: IConfigurableFormComponent = useMemo(() => {
            return {
                ...model?.sourceComponent,
                hideLabel: true,
                readOnly: model?.readOnly,
                editMode: model.editMode,
                hidden: model.hidden
            };
        }, [model.hidden, model?.readOnly, model?.id]);

        const props = { ...(!!model?.label ? model : model?.sourceComponent) };

        if (model.hidden) return null;

        return (
            <ConfigurableFormItem model={props} className='sha-js-label' >
                {(value, onChange) => (
                    <SettingsControl
                        propertyName={model.propertyName}
                        mode={'value'}
                        onChange={onChange}
                        value={value}
                    >
                        {(_valueValue, _onChangeValue, propertyName) => {
                            return (
                                <SettingsControlRenderer
                                    id={props.id}
                                    component={component}
                                    propertyName={propertyName}
                                />
                            );
                        }}
                    </SettingsControl>
                )}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
    migrator: (m) => m
        .add<ISettingsComponentProps>(0, (prev) => migrateReadOnly(prev))
    ,
};

export default SettingsComponent;
