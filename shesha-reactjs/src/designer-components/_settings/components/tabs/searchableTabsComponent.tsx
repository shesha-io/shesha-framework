import React, { useState, useEffect } from 'react';
import { Tabs, Input } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { SearchQueryProvider } from './context';
import { filterDynamicComponents, searchFormItems } from '../utils';

interface SearchableTabsProps {
    model: any;
    value?: any;
    onChange?: (value: any) => void;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model, onChange }) => {
    const { tabs } = model;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTabs, setFilteredTabs] = useState(tabs);

    useEffect(() => {
        const newFilteredTabs = tabs
            .map((tab: any) => {
                const filteredComponents = tab.components
                    ? filterDynamicComponents(tab.components, searchQuery)
                    : searchFormItems(tab.children, searchQuery);

                const hasVisibleComponents = Array.isArray(filteredComponents)
                    ? filteredComponents.some(comp => !comp.hidden)
                    : !!filteredComponents;

                return {
                    ...tab,
                    label: tab.label || tab.title,
                    children: tab.components
                        ? <ParentProvider model={model}>
                            <ComponentsContainer
                                containerId={tab.id + tab.key}
                                dynamicComponents={filteredComponents} />
                        </ParentProvider>
                        : filteredComponents,
                    hidden: !hasVisibleComponents
                };
            })
            .filter(tab => !tab.hidden);

        setFilteredTabs(newFilteredTabs);
    }, [searchQuery, tabs]);

    return (
        <SearchQueryProvider searchQuery={searchQuery} onChange={onChange}>
            <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Tabs
                defaultActiveKey={'1'}
                size={model.size}
                type={model.tabType || 'card'}
                tabPosition={model.position || 'top'}
                items={filteredTabs}
            />
        </SearchQueryProvider>
    );
};

export default SearchableTabs;
