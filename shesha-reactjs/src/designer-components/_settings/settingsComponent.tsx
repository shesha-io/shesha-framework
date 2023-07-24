import React from 'react';
import { IToolboxComponent } from '../../interfaces';
import { SettingOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, useForm } from '../../providers';
import { ComponentsContainer, ConfigurableFormItem } from 'components';
import SettingsControl from './settingsControl';

export interface ISettingsComponentProps extends IConfigurableFormComponent {
    components?: IConfigurableFormComponent[];
}

const SettingsComponent: IToolboxComponent<ISettingsComponentProps> = {
    type: 'setting',
    isInput: true,
    isOutput: true,
    name: 'Setting',
    isHidden: false,
    icon: <SettingOutlined />,
    factory: (model: ISettingsComponentProps) => {

        const { formData, setFormData } = useForm();

        let props: IConfigurableFormComponent = Boolean(model?.label)
            ? model
            : model?.components?.length > 0 ? model?.components[0] : null;
        const components = model?.components?.map(c => ({ ...c, hideLabel: true, readOnly: model?.readOnly }));
    
        return (
            <ConfigurableFormItem model={{...props}} >
                <SettingsControl 
                    formData={formData}
                    onChangeValues={(changedValues) => {
                        setFormData({values: changedValues, mergeValues: true});
                    }}
                    name={props.propertyName}
                >
                    <ComponentsContainer containerId={props.id} dynamicComponents={components}/>
                </SettingsControl>
            </ConfigurableFormItem>
        );
    }
};

export default SettingsComponent;
