import React, { useState, useEffect } from 'react';
import { Tabs, Input, Button } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { SearchQueryProvider } from './context';
import { filterDynamicComponents, searchFormItems, SettingInput } from '../utils';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

interface SearchableTabsProps {
    model: any;
    value?: any;
    onChange?: (value: any) => void;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model, onChange, value }) => {

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
                    label: <div style={{ display: 'flex', gap: '5px', verticalAlign: 'middle', flexDirection: 'row-reverse', alignItems: 'baseline' }}>
                        {tab.label || tab.title}
                        {tab.label === 'Display' && <SettingInput label="" hideLabel property='hidden' readOnly={model.readOnly} jsSetting={false}>
                            <><Button type='text' style={{ alignItems: 'center' }} ghost={value ? false : true} size='small' icon={value ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => {
                                value({ ...model, hidden: !value.hidden });
                            }} />
                            </>
                        </SettingInput>}
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
