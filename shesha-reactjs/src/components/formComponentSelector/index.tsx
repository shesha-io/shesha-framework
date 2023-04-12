import { Button, Input, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { IConfigurableFormComponent, IToolboxComponent } from 'interfaces';
import { nanoid } from 'nanoid';
import { useFormDesignerComponents } from 'providers/form/hooks';
import { upgradeComponent } from 'providers/form/utils';
import React, { FC, useMemo, useState } from 'react';
import ComponentSettingsModal from './componentSettingsModal';

export type ComponentType = 'input' | 'output';

interface ComponentSelectorValue {
    type: string;
    settings?: IConfigurableFormComponent;
}

export interface IFormComponentSelectorProps {
    componentType: ComponentType;
    noSelectionItem?: DefaultOptionType;
    value?: ComponentSelectorValue;
    onChange?: (value?: ComponentSelectorValue) => void;
    readOnly?: boolean;
}

export const FormComponentSelector: FC<IFormComponentSelectorProps> = (props) => {
    const { componentType, noSelectionItem, value, onChange, readOnly = false } = props;

    const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
    const allComponents = useFormDesignerComponents();
    const editors = useMemo(() => {
        const result: IToolboxComponent[] = [];
        for (const key in allComponents) {
            if (allComponents.hasOwnProperty(key)) {
                const component = allComponents[key];
                if (component.isHidden !== true && (component.isInput === true && componentType === 'input' || component.isOutput === true && componentType === 'output'))
                    result.push(allComponents[key]);
            }
        }
        const sorted = result.sort((a, b) => a.name > b.name ? 1 : a.name === b.name ? 0 : -1);
        return sorted;
    }, [allComponents, componentType]);

    const options = useMemo<DefaultOptionType[]>(() => {
        const result = editors.map<DefaultOptionType>(editor => ({ label: editor.name, value: editor.type }));
        if (noSelectionItem)
            result.splice(0, 0, noSelectionItem);
        return result;
    }, [editors]);

    const formComponent = useMemo<IToolboxComponent>(() => {
        if (!Boolean(value?.type))
            return null;

        return allComponents[value?.type];
    }, [value?.type]);

    const canConfigure = Boolean(formComponent);
    const selectStyle = { width: canConfigure ? 'calc(100% - 100px)' : '100%' };

    const getComponentModel = (toolboxComponent: IToolboxComponent) => {
        if (!toolboxComponent)
            return null;

        let componentModel: IConfigurableFormComponent = {
            id: nanoid(),
            type: toolboxComponent.type,
            name: 'editor',
            hidden: false,
            visibility: 'Yes',
            customVisibility: null,
            visibilityFunc: _data => true,
            enabledFunc: _data => true,
            isDynamic: false,
        };
        if (toolboxComponent.initModel)
            componentModel = toolboxComponent.initModel(componentModel);
        if (toolboxComponent.migrator) {
            componentModel = upgradeComponent(componentModel, toolboxComponent, { allComponents: {}, componentRelations: {} });
        }
        return componentModel;
    };

    const onSelectChange = (selectedValue: string) => {
        if (onChange) {

            const component = selectedValue
                ? allComponents[selectedValue]
                : null;
            const settings = getComponentModel(component);

            onChange(selectedValue ? { type: selectedValue, settings } : null);
        }
    };
    const onClear = () => {
        if (onChange)
            onChange(null);
    };

    const onConfigureClick = () => {
        setIsSettingsVisible(true);
    };
    const onCancelConfigureClick = () => {
        setIsSettingsVisible(false);
    };
    const onSettingsSaveClick = (data) => {
        if (onChange) {
            const newValue: ComponentSelectorValue = { ...value, settings: data };
            onChange(newValue);
        }

        setIsSettingsVisible(false);
        return Promise.resolve();
    };

    return (
        <Input.Group>
            <Select<string>
                disabled={readOnly}
                options={options}
                style={selectStyle}
                value={value?.type}
                onChange={onSelectChange}
                onClear={onClear}
                allowClear
            />
            {canConfigure && (<Button style={{ width: '100px' }} onClick={onConfigureClick}>Configure</Button>)}
            <ComponentSettingsModal
                readOnly={readOnly}
                formComponent={formComponent}
                isVisible={isSettingsVisible}
                model={value?.settings}
                onSave={onSettingsSaveClick}
                onCancel={onCancelConfigureClick}
            />
        </Input.Group>
    );
};

export default FormComponentSelector;