import { Button, Space, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent, IEditorAdapter, IToolboxComponent, IToolboxComponentBase, IToolboxComponents } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { nanoid } from '@/utils/uuid';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { upgradeComponent } from '@/providers/form/utils';
import React, { FC, useMemo, useState } from 'react';
import { editorAdapters } from './adapters';
import ComponentSettingsModal from './componentSettingsModal';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export type ComponentType = 'input' | 'output';

export interface ComponentSelectorValue {
  type: string;
  settings?: IConfigurableFormComponent | undefined;
}

export interface IFormComponentSelectorProps {
  componentType: ComponentType;
  noSelectionItem?: DefaultOptionType | undefined;
  value?: ComponentSelectorValue | undefined;
  onChange?: ((value: ComponentSelectorValue | null) => void) | undefined;
  readOnly?: boolean | undefined;
  size?: SizeType | undefined;
  propertyMeta?: IPropertyMetadata | undefined;
}

export const getEditorAdapter = (component: IToolboxComponentBase): IEditorAdapter | undefined => {
  return component.editorAdapter ?? editorAdapters[component.type];
};

const getEditorAdapterByType = (components: IToolboxComponents, type: string): IEditorAdapter | undefined => {
  const component = components[type];
  return component ? getEditorAdapter(component) : undefined;
};

const canBeUsedAsEditor = (component: IToolboxComponentBase): boolean => {
  const adapter = getEditorAdapter(component);
  return Boolean(adapter);
};

export const FormComponentSelector: FC<IFormComponentSelectorProps> = (props) => {
  const { componentType, noSelectionItem, value, onChange, readOnly = false, propertyMeta } = props;

  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const allComponents = useFormDesignerComponents();
  const editors = useMemo(() => {
    const result: IToolboxComponentBase[] = [];
    for (const key in allComponents) {
      if (allComponents.hasOwnProperty(key)) {
        const component = allComponents[key];
        if (!isDefined(component) || !canBeUsedAsEditor(component)) continue; // skip components without adapters

        if (
          component.isHidden !== true &&
          ((component.isInput === true && componentType === 'input') ||
            (component.isOutput === true && componentType === 'output'))
        )
          result.push(component);
      }
    }
    const sorted = result.sort((a, b) => (a.name > b.name ? 1 : a.name === b.name ? 0 : -1));
    return sorted;
  }, [allComponents, componentType]);

  const options = useMemo<DefaultOptionType[]>(() => {
    const result = editors.map<DefaultOptionType>((editor) => ({
      // capitalise the first letter of each word
      label: editor?.name?.replace(/\b\w/g, (char) => char.toUpperCase()),
      value: editor.type }));
    if (noSelectionItem)
      result.splice(0, 0, noSelectionItem);

    return result;
  }, [editors, noSelectionItem]);

  const valueType = value?.type;
  const formComponent = useMemo<IToolboxComponentBase | undefined>(() => {
    return !isNullOrWhiteSpace(valueType)
      ? allComponents[valueType]
      : undefined;
  }, [allComponents, valueType]);

  const selectStyle = { width: isDefined(formComponent) ? 'calc(100% - 100px)' : '100%' };

  const getComponentModel = (toolboxComponent: IToolboxComponent | undefined): IConfigurableFormComponent | undefined => {
    if (!toolboxComponent) return undefined;

    let componentModel: IConfigurableFormComponent = {
      id: nanoid(),
      type: toolboxComponent.type,
      propertyName: 'editor',
      hidden: false,
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

  const onSelectChange = (selectedValue: string): void => {
    if (onChange) {
      const component = selectedValue ? allComponents[selectedValue] : undefined;
      const settings = getComponentModel(component);

      onChange(selectedValue ? { type: selectedValue, settings } : null);
    }
  };
  const onClear = (): void => {
    if (onChange) onChange(null);
  };

  const onConfigureClick = (): void => {
    setIsSettingsVisible(true);
  };
  const onCancelConfigureClick = (): void => {
    setIsSettingsVisible(false);
  };
  const onSettingsSaveClick = (data: IConfigurableFormComponent): Promise<void> => {
    if (onChange && value?.type) {
      const newValue: ComponentSelectorValue = { ...value, settings: data };
      onChange(newValue);
    }

    setIsSettingsVisible(false);
    return Promise.resolve();
  };

  const propertyFilter = (name: string): boolean => {
    const adapter = value?.type
      ? getEditorAdapterByType(allComponents, value.type)
      : null;
    if (!adapter) return false;

    return !adapter.propertiesFilter || adapter.propertiesFilter(name);
  };

  return (
    <Space.Compact style={{ width: "100%", borderRadius: '5px' }}>
      <Select<string>
        disabled={readOnly}
        options={options}
        style={selectStyle}
        value={value?.type ?? null}
        onChange={onSelectChange}
        onClear={onClear}
        size={props.size}
        allowClear
      />
      {isDefined(formComponent) && value?.settings && (
        <>
          <Button style={{ width: '100px', borderBottomRightRadius: '5px', borderTopRightRadius: '5px' }} size={props.size} onClick={onConfigureClick}>
            Configure
          </Button>
          <ComponentSettingsModal
            readOnly={readOnly}
            formComponent={formComponent}
            isVisible={isSettingsVisible}
            model={value.settings}
            onSave={onSettingsSaveClick}
            onCancel={onCancelConfigureClick}
            propertyFilter={propertyFilter}
          />
        </>
      )}
    </Space.Compact>
  );
};

export default FormComponentSelector;
