import React, { useState, useEffect } from 'react';
import { Tabs, Input } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { SearchQueryProvider } from './context';
import { filterDynamicComponents, searchFormItems } from '../utils';
import { useStyles } from './style';

interface SearchableTabsProps {
    model: any;
    value?: any;
    onChange?: (value: any) => void;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model, onChange }) => {

    const { tabs } = model;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTabs, setFilteredTabs] = useState(tabs);
    const { styles } = useStyles();

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
                    label: <div style={{ display: 'flex', gap: '5px', verticalAlign: 'middle', flexDirection: 'row-reverse', alignItems: 'baseline' }}>
                        {tab.label || tab.title}
                        {tab.label === 'Display'}
                    </div>,
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

        console.log('filteredTabs:::;', filteredTabs);
    }, [searchQuery, tabs]);

    return (
        <SearchQueryProvider searchQuery={searchQuery} onChange={onChange}>
            <div
                className={styles.searchField}
                style={{
                    position: 'sticky',
                    top: -15,
                    zIndex: 2,
                    width: '100%',
                    background: '#fff',
                    padding: '8px 16px'
                }}
            >
                <Input
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
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
