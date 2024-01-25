import React, { useMemo } from 'react';
import SettingsControl from './settingsControl';
import { ConfigurableFormItem } from '@/components';
import { getSettings } from './settings';
import { IConfigurableFormComponent } from '@/providers';
import { IToolboxComponent } from '@/interfaces';
import { migrateReadOnly } from '../_common-migrations/migrateSettings';
import { SettingOutlined } from '@ant-design/icons';
import { SettingsControlRenderer } from './settingsControlRenderer';
import { useDeepCompareMemo } from '@/index';

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
        const components: IConfigurableFormComponent[] = useDeepCompareMemo(() => {
            return model?.components?.map(c => ({
                ...c,
                hideLabel: true,
                readOnly: model?.readOnly,
                editMode: model.editMode,
                hidden: model.hidden
            }));
        }, [model?.components, model?.readOnly, model?.id]);

        const props = useMemo(() => {
            const internalProps =
                Boolean(model?.label) || !(model?.components?.length > 0)
                    ? model
                    : model?.components[0];
            return { ...internalProps };
        }, [model?.label, model?.components?.length]);

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
                                    components={components}
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
