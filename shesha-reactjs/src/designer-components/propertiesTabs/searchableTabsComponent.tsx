import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Tabs, Input, Empty, InputRef } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useStyles } from './style';
import { SearchOutlined } from '@ant-design/icons';
import { filterDynamicComponents } from './utils';
import { ITabPaneProps, IPropertiesTabsComponentProps } from './models';
import { IConfigurableFormComponent } from '@/interfaces';
import { useFormStateOrUndefined, useFormActionsOrUndefined } from '@/providers/form';
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

  const formState = useFormStateOrUndefined();
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

  const isComponentHidden = (component: IConfigurableFormComponent & { inputs?: IConfigurableFormComponent[] }): boolean => {
    if (formState?.name === "modalSettings") {
      if (component.inputs) {
        const visibleInputs = component.inputs.filter((input) => {
          if (!input.propertyName) return true;
          return formActions?.isComponentFiltered(input);
        });

        if (visibleInputs.length === 0) {
          return false;
        }

        component.inputs = visibleInputs;

        return visibleInputs.length > 0;
      }

      return formActions?.isComponentFiltered(component);
    } else {
      return true;
    }
  };

  type TabItem = ITabPaneProps & { children?: IConfigurableFormComponent[] };

  const newFilteredTabs = tabs
    .map((tab: TabItem, index: number) => {
      const filteredComponents = tab.children ?? filterDynamicComponents(tab.components ?? [], searchQuery);

      const visibleComponents = Array.isArray(filteredComponents)
        ? filteredComponents.filter((comp) => isComponentHidden(comp))
        : filteredComponents;

      const hasVisibleComponents = Array.isArray(visibleComponents)
        ? visibleComponents.length > 0
        : !!visibleComponents;

      const tabKey = tab.key || (index + 1).toString();

      return {
        ...tab,
        key: tabKey,
        label: tab.label ?? tab.title,
        components: visibleComponents,
        children: visibleComponents.length === 0
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
        hidden: tab.hidden || !hasVisibleComponents,
      };
    })
    .filter((tab) => !tab.hidden);

  const effectiveActiveKey = useMemo(() => {
    if (newFilteredTabs.length === 0) {
      return undefined;
    }

    const persistedKey = formDesigner?.activeSettingsTabKey ?? localActiveTabKey;

    // When searching, only auto-switch if the currently persisted tab is no longer visible
    if (searchQuery && !newFilteredTabs.some((tab) => tab.key === persistedKey)) {
      const firstVisibleTab = newFilteredTabs.find((tab) =>
        Array.isArray(tab.components) ? tab.components.length > 0 : !!tab.components,
      );
      if (firstVisibleTab) {
        return firstVisibleTab.key;
      }
    }

    // Use persisted/local key if still valid
    if (newFilteredTabs.some((tab) => tab.key === persistedKey)) {
      return persistedKey;
    }

    // Fallback to first available tab
    return newFilteredTabs[0].key;
  }, [searchQuery, newFilteredTabs, formDesigner, localActiveTabKey]);

  const localTabs = useMemo(() => (
    <Tabs
      key="searchable-tabs"
      activeKey={effectiveActiveKey}
      onChange={handleTabChange}
      size={model.size}
      type={model.tabType || 'card'}
      tabPosition={model.position || 'top'}
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
