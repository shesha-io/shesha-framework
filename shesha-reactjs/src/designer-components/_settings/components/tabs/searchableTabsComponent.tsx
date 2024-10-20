import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Input, Empty } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { SearchQueryProvider } from './context';
import { filterDynamicComponents, isHidden, searchFormItems } from '../utils';
import { useStyles } from './style';
import { SearchOutlined } from '@ant-design/icons';

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

    const ref = useRef(null);

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
    }, [searchQuery, tabs]);

    return (
        <SearchQueryProvider searchQuery={searchQuery} onChange={onChange}>
            <div
                className={styles.searchField}
                style={{
                    position: 'sticky',
                    top: -16,
                    zIndex: 2,
                    padding: '8px 0'
                }}
            >
                <Input
                    type="search"
                    size='small'
                    allowClear
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suffix={
                        <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                    }
                />
            </div>
            {isHidden(ref, 100) && searchQuery ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Properties not found" />
                :
                <div ref={ref}>
                    <Tabs
                        defaultActiveKey={'1'}
                        size={model.size}
                        type={model.tabType || 'card'}
                        tabPosition={model.position || 'top'}
                        items={filteredTabs}
                    />
                </div>
            }
        </SearchQueryProvider>
    );
};

export default SearchableTabs;
