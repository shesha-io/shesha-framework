import React, { useState } from 'react';
import { Tabs, Input, Empty } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { useStyles } from './style';
import { SearchOutlined } from '@ant-design/icons';
import { filterDynamicComponents } from './utils';
import { ITabsComponentProps } from './models';

interface SearchableTabsProps {
    model: ITabsComponentProps;
    data?: any;
    value: any;
    onChange?: (value: any) => void;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model, onChange, data }) => {

    const { tabs } = model;
    const [searchQuery, setSearchQuery] = useState('');
    const { styles } = useStyles();

    const newFilteredTabs = tabs
        .map((tab: any) => {
            const filteredComponents = tab.children ?? filterDynamicComponents(tab.components, searchQuery, data);
            const hasVisibleComponents = Array.isArray(filteredComponents)
                ? filteredComponents.some(comp => !comp.hidden)
                : !!filteredComponents;

            return {
                ...tab,
                label: tab.label ?? tab.title,
                components: filteredComponents,
                children: tab.components.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Properties not found" /> : <ParentProvider model={model}>
                    <ComponentsContainer
                        containerId={tab.id + tab.key}
                        dynamicComponents={filteredComponents} />
                </ParentProvider>,
                hidden: !hasVisibleComponents
            };
        })
        .filter(tab => !tab.hidden);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <>
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
                    placeholder="Search properties"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    suffix={
                        <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                    }
                />
            </div>
            {newFilteredTabs.length === 0 && searchQuery ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Property Not Found" />
                :
                <Tabs
                    defaultActiveKey={'1'}
                    size={model.size}
                    type={model.tabType || 'card'}
                    tabPosition={model.position || 'top'}
                    items={newFilteredTabs}
                    className={styles.content}
                />
            }
        </>
    );
};

export default SearchableTabs;
