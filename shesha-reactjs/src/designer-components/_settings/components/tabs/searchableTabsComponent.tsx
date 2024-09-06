import React, { useState, useEffect } from 'react';
import { Tabs, Input } from 'antd';
import { searchFormItems } from '../utils';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { SearchQueryProvider } from './context';

interface SearchableTabsProps {
    model: any;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model }) => {
    const { tabs, isDynamic } = model;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTabs, setFilteredTabs] = useState(tabs);

    useEffect(() => {

        setFilteredTabs(tabs.map(tab => ({
            ...tab,
            children: tab.components
                ? <ParentProvider model={[]}>
                    <ComponentsContainer
                        containerId={tab.id + tab.key}
                        dynamicComponents={!isDynamic ? filterDynamicComponents(tab.components, searchQuery) : []} />
                </ParentProvider>
                : searchFormItems(tab.children, searchQuery)
        })));
    }, [tabs, searchQuery, model]);

    return (
        <SearchQueryProvider searchQuery={searchQuery}>
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

// Add this function outside of the component
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
