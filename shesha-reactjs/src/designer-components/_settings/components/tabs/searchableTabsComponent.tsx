import React, { useState, useEffect } from 'react';
import { Tabs, Input } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { SearchQueryProvider } from './context';
import { searchFormItems } from '../utils';

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
        setFilteredTabs(tabs.map((tab: any) => ({
            ...tab,
            label: tab.label || tab.title,
            children: tab.components
                ? <ParentProvider model={model}>
                    <ComponentsContainer
                        containerId={tab.id + tab.key}
                        dynamicComponents={filterDynamicComponents(tab.components, searchQuery)} />
                </ParentProvider>
                : searchFormItems(tab.children, searchQuery)
        })));
    }, [searchQuery]);

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

const filterDynamicComponents = (components, query) => {

    const filterResult = components.map(c => {
        if (!c.label) return c;

        return ({
            ...c,
            hidden: !c.label?.toLowerCase().includes(query.toLowerCase()),
            components: c.components ? filterDynamicComponents(c.components, query) : undefined
        })
    });

    return filterResult;
};

export default SearchableTabs;
