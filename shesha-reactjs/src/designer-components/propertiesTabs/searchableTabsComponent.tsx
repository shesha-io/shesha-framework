import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Tabs, Input, Empty, InputRef } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useStyles } from './style';
import { SearchOutlined } from '@ant-design/icons';
import { filterDynamicComponents } from './utils';
import { ITabPaneProps, IPropertiesTabsComponentProps } from './models';
import { IConfigurableFormComponent } from '@/interfaces';
import { useFormActionsOrUndefined } from '@/providers/form';
import { useShaFormDataUpdate } from '@/providers/form/providers/shaFormProvider';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';

interface SearchableTabsProps {
  model: IPropertiesTabsComponentProps;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model }) => {
  const { tabs } = model;
  const formDesigner = useFormDesignerOrUndefined();
  const [searchQuery, setSearchQuery] = useState('');
  const [localActiveTabKey, setLocalActiveTabKey] = useState<string>(formDesigner?.activeSettingsTabKey ?? '1');
  const { styles } = useStyles();

  const formActions = useFormActionsOrUndefined();

  useShaFormDataUpdate();

  const searchInputRef = useRef<InputRef>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const renderSearchInput = (options?: {
    ref?: React.RefObject<InputRef>;
    className?: string;
    style?: React.CSSProperties;
    autoFocus?: boolean;
    wrapperStyle?: React.CSSProperties;
  }): JSX.Element => {
    const input = (
      <Input
        type="search"
        size="small"
        allowClear
        placeholder="Search properties"
        value={searchQuery}
        onChange={handleSearchChange}
        suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
        ref={options?.ref}
        className={options?.className}
        style={options?.style}
        autoFocus={options?.autoFocus}
      />
    );

    return options?.wrapperStyle ? (
      <div className={styles.searchField} style={options.wrapperStyle}>
        {input}
      </div>
    ) : input;
  };

  const handleTabChange = useCallback((newActiveKey: string): void => {
    formDesigner?.setActiveSettingsTabKey(newActiveKey);
    setLocalActiveTabKey(newActiveKey);
  }, [formDesigner]);

  // Applies the form-level component filter (e.g. permissions / modal settings)
  // on top of the search filter. For components that hold a list of `inputs`
  // (such as settingsInputRow), it prunes the inputs to only those allowed so
  // that non-matching/non-permitted inputs never leak through. Returns the
  // (possibly pruned) component, or null when nothing should remain visible.
  const applyComponentFilter = (
    component: IConfigurableFormComponent & { inputs?: IConfigurableFormComponent[] },
  ): (IConfigurableFormComponent & { inputs?: IConfigurableFormComponent[] }) | null => {
    if (!formActions?.isComponentFiltered) return component;

    if (component.inputs) {
      const visibleInputs = component.inputs.filter((input) => {
        if (!input.propertyName) return true;
        return formActions.isComponentFiltered(input);
      });
      if (visibleInputs.length === 0) return null;
      return { ...component, inputs: visibleInputs };
    }

    return formActions.isComponentFiltered(component) ? component : null;
  };

  const isSearching = searchQuery.trim() !== '';

  // While searching we render the *filtered* component models directly instead
  // of letting the designer re-read the original (unfiltered) models from the
  // form markup store. Marking the components as dynamic forces
  // ConfigurableFormComponent to use the model we pass in (with its pruned
  // children/inputs) rather than re-fetching the original by id.
  const markDynamic = (component: IConfigurableFormComponent): IConfigurableFormComponent => {
    const c: any = { ...component, isDynamic: true };
    if (Array.isArray(c.components)) c.components = c.components.map(markDynamic);
    if (c.content && Array.isArray(c.content.components)) {
      c.content = { ...c.content, components: c.content.components.map(markDynamic) };
    }
    return c;
  };

  type TabItem = ITabPaneProps & { children?: IConfigurableFormComponent[] };

  const newFilteredTabs = tabs
    .map((tab: TabItem, index: number) => {
      const searchFiltered = filterDynamicComponents(tab.components ?? [], searchQuery);

      const visibleComponents = searchFiltered
        .map((comp) => applyComponentFilter(comp))
        .filter((comp): comp is IConfigurableFormComponent => comp !== null)
        .map((comp) => (isSearching ? markDynamic(comp) : comp));

      const hasVisibleComponents = visibleComponents.length > 0;

      const tabKey = tab.key || (index + 1).toString();

      return {
        ...tab,
        key: tabKey,
        label: tab.label ?? tab.title,
        components: visibleComponents,
        children: !hasVisibleComponents
          ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Properties not found" />
          : (
            <ParentProvider model={model}>
              <ComponentsContainer
                containerId={tab.id + tab.key}
                dynamicComponents={visibleComponents}
              />
            </ParentProvider>
          ),
        forceRender: false,
        hidden: tab.hidden || (searchQuery.trim() !== '' && !hasVisibleComponents),
      };
    })
    .filter((tab) => !tab.hidden);

  const effectiveActiveKey = useMemo(() => {
    if (newFilteredTabs.length === 0) return undefined;

    const persistedKey = formDesigner?.activeSettingsTabKey ?? localActiveTabKey;

    if (newFilteredTabs.some((tab) => tab.key === persistedKey)) {
      return persistedKey;
    }

    return newFilteredTabs[0].key;
  }, [newFilteredTabs, formDesigner, localActiveTabKey]);

  const localTabs = useMemo(() => (
    <Tabs
      key="searchable-tabs"
      activeKey={effectiveActiveKey}
      onChange={handleTabChange}
      size={model.size}
      type={model.tabType || 'card'}
      tabPlacement={model.position || 'top'}
      items={newFilteredTabs}
      className={styles.content}
    />
  ), [effectiveActiveKey, handleTabChange, model.size, model.tabType, newFilteredTabs, styles.content, model.position]);

  return (
    <>
      {renderSearchInput({
        ref: searchInputRef,
        autoFocus: newFilteredTabs.length === 0,
        className: styles.searchField,
      })}
      {newFilteredTabs.length === 0 && searchQuery
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Property Not Found" />
        : localTabs}
    </>
  );
};

export default SearchableTabs;
