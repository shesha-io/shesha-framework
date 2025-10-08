import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tabs, Input, Empty, theme } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { useStyles } from './style';
import { SearchOutlined } from '@ant-design/icons';
import { filterDynamicComponents } from './utils';
import { ITabsComponentProps } from './models';
import { useFormState, useFormActions } from '@/providers/form';
import { useShaFormDataUpdate } from '@/providers/form/providers/shaFormProvider';

interface SearchableTabsProps {
  model: ITabsComponentProps;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model }) => {
  const { tabs } = model;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabKey, setActiveTabKey] = useState('1');
  const searchRefs = useRef(new Map());
  const { styles } = useStyles();
  const { token } = theme.useToken();

  const formState = useFormState(false);
  const formActions = useFormActions(false);

  useShaFormDataUpdate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const focusActiveTabSearch = useCallback(() => {
    const activeSearchInput = searchRefs.current.get(activeTabKey);
    if (activeSearchInput) {
      // Small delay to ensure the tab is rendered
      setTimeout(() => {
        activeSearchInput.focus();
      }, 50);
    }
  }, [activeTabKey]);

  const handleTabChange = (newActiveKey: string): void => {
    setActiveTabKey(newActiveKey);
  };

  // Focus search input when search query changes and we have matching results
  useEffect(() => {
    if (searchQuery) {
      focusActiveTabSearch();
    }
  }, [searchQuery, focusActiveTabSearch]);

  // Focus search input when tab changes
  useEffect(() => {
    focusActiveTabSearch();
  }, [activeTabKey, focusActiveTabSearch]);

  const isComponentHidden = (component): boolean => {
    if (formState.name === "modalSettings") {
      if (component.inputs) {
        const visibleInputs = component.inputs.filter((input) => {
          if (!input.propertyName) return true;
          return formActions.isComponentFiltered(input);
        });

        if (visibleInputs.length === 0) {
          return false;
        }

        component.inputs = visibleInputs;

        return visibleInputs.length > 0;
      }

      return formActions.isComponentFiltered(component);
    } else {
      return true;
    }
  };

  const newFilteredTabs = tabs
    .map((tab: any, index: number) => {
      const filteredComponents = tab.children ?? filterDynamicComponents(tab.components, searchQuery, token.colorPrimary);

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
              <Input
                type="search"
                size="small"
                allowClear
                style={{
                  marginBottom: '16px',
                }}
                ref={(el) => {
                  if (el) {
                    searchRefs.current.set(tabKey, el);
                  } else {
                    searchRefs.current.delete(tabKey);
                  }
                }}
                placeholder="Search properties"
                value={searchQuery}
                onChange={handleSearchChange}
                suffix={
                  <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                }
              />
              <ComponentsContainer
                containerId={tab.id + tab.key}
                dynamicComponents={visibleComponents}
              />
            </ParentProvider>
          ),
        forceRender: true,
        hidden: tab.hidden || !hasVisibleComponents,
      };
    })
    .filter((tab) => !tab.hidden);

  // Auto-switch to the first tab that has visible components when searching
  useEffect(() => {
    if (searchQuery && newFilteredTabs.length > 0) {
      const firstVisibleTab = newFilteredTabs.find((tab) =>
        Array.isArray(tab.components) ? tab.components.length > 0 : !!tab.components,
      );
      if (firstVisibleTab && firstVisibleTab.key !== activeTabKey) {
        setActiveTabKey(firstVisibleTab.key);
      }
    }
  }, [searchQuery, newFilteredTabs, activeTabKey]);

  // Ensure we have a valid active tab key
  useEffect(() => {
    if (newFilteredTabs.length > 0 && !newFilteredTabs.find((tab) => tab.key === activeTabKey)) {
      setActiveTabKey(newFilteredTabs[0].key);
    }
  }, [newFilteredTabs, activeTabKey]);


  return (
    <>
      {newFilteredTabs.length === 0 && (
        <div
          className={styles.searchField}
          style={{
            position: 'sticky',
            top: -16,
            zIndex: 2,
            padding: '8px 0',
          }}
        >
          <Input
            type="search"
            size="small"
            allowClear
            placeholder="Search properties"
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
            suffix={
              <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            }
          />
        </div>
      )}
      {newFilteredTabs.length === 0 && searchQuery
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Property Not Found" />
        : (
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            size={model.size}
            type={model.tabType || 'card'}
            tabPosition={model.position || 'top'}
            items={newFilteredTabs}
            className={styles.content}
          />
        )}
    </>
  );
};

export default SearchableTabs;
