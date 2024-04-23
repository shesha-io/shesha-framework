import { Button, Space, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { nanoid } from '@/utils/uuid';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { upgradeComponent } from '@/providers/form/utils';
import React, { FC, useMemo, useState } from 'react';
import { editorAdapters } from './adapters';
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
  propertyMeta?: IPropertyMetadata;
}

export const FormComponentSelector: FC<IFormComponentSelectorProps> = (props) => {
  const { componentType, noSelectionItem, value, onChange, readOnly = false, propertyMeta } = props;

  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const allComponents = useFormDesignerComponents();
  const editors = useMemo(() => {
    const result: IToolboxComponent[] = [];
    for (const key in allComponents) {
      if (allComponents.hasOwnProperty(key)) {
        if (!editorAdapters[key]) continue; // skip components without adapters, will be changed later after review of the all components
        const component = allComponents[key];

        if (
          component.isHidden !== true &&
          ((component.isInput === true && componentType === 'input') ||
            (component.isOutput === true && componentType === 'output'))
        )
          result.push(allComponents[key]);
      }
    }
    const sorted = result.sort((a, b) => (a.name > b.name ? 1 : a.name === b.name ? 0 : -1));
    return sorted;
  }, [allComponents, componentType]);

  const options = useMemo<DefaultOptionType[]>(() => {
    const result = editors.map<DefaultOptionType>((editor) => ({ label: editor.name, value: editor.type }));
    if (noSelectionItem) result.splice(0, 0, noSelectionItem);

    return result;
  }, [editors]);

  const formComponent = useMemo<IToolboxComponent>(() => {
    if (!Boolean(value?.type)) return null;

    return allComponents[value?.type];
  }, [value?.type]);

  const canConfigure = Boolean(formComponent);
  const selectStyle = { width: canConfigure ? 'calc(100% - 100px)' : '100%' };

  const getComponentModel = (toolboxComponent: IToolboxComponent) => {
    if (!toolboxComponent) return null;

    let componentModel: IConfigurableFormComponent = {
      id: nanoid(),
      type: toolboxComponent.type,
      propertyName: 'editor',
      hidden: false,
      visibilityFunc: (_data) => true,
      enabledFunc: (_data) => true,
      isDynamic: false,
    };
    if (toolboxComponent.initModel) componentModel = toolboxComponent.initModel(componentModel);
    if (toolboxComponent.migrator) {
      componentModel = upgradeComponent(componentModel, toolboxComponent, DEFAULT_FORM_SETTINGS, {
        allComponents: {},
        componentRelations: {},
      });
    }
    if (toolboxComponent.linkToModelMetadata && propertyMeta) {
      componentModel = toolboxComponent.linkToModelMetadata(componentModel, propertyMeta);
    }

    return componentModel;
  };

  const onSelectChange = (selectedValue: string) => {
    if (onChange) {
      const component = selectedValue ? allComponents[selectedValue] : null;
      const settings = getComponentModel(component);

      onChange(selectedValue ? { type: selectedValue, settings } : null);
    }
  };
  const onClear = () => {
    if (onChange) onChange(null);
  };

  // this part is required only for old forms to call the linkToModelMetadata
  const modalData = useMemo(() => {
    if (!value?.settings)
      return undefined;

    const component = value && value.type ? allComponents[value.type] : null;
    if (!component || !component.linkToModelMetadata || !propertyMeta)
      return value?.settings;

    return component.linkToModelMetadata(value.settings, propertyMeta);
  }, [value?.type, value?.settings, componentType, propertyMeta]);

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

  const propertyFilter = (name: string): boolean => {
    const adapter = value?.type ? editorAdapters[value.type] : null;
    if (!adapter) return false;

    return !adapter.propertiesFilter || adapter.propertiesFilter(name);
  };

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select<string>
        disabled={readOnly}
        options={options}
        style={selectStyle}
        value={value?.type}
        onChange={onSelectChange}
        onClear={onClear}
        allowClear
      />
      {canConfigure && (
        <Button style={{ width: '100px' }} onClick={onConfigureClick}>
          Configure
        </Button>
      )}
      <ComponentSettingsModal
        readOnly={readOnly}
        formComponent={formComponent}
        isVisible={isSettingsVisible}
        model={modalData}
        onSave={onSettingsSaveClick}
        onCancel={onCancelConfigureClick}
        propertyFilter={propertyFilter}
      />
    </Space.Compact>
  );
};

export default FormComponentSelector;
