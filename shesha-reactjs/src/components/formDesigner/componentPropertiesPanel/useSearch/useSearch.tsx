import { Input, Tabs, Collapse } from 'antd';
import React, { useState, useEffect, useRef } from 'react';

const { TabPane } = Tabs;
const { Panel } = Collapse;

export const useSearch = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    return { searchQuery, handleSearch };
};

export const SearchInput = ({ onSearch }: { onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <Input
        placeholder="Search"
        allowClear
        style={{ marginBottom: 10 }}
        onChange={onSearch}
    />
);

export const SettingsTabs = ({ tabs }: { tabs: any[] }) => {
    const { searchQuery, handleSearch } = useSearch();
    const collapseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        const elements = document.querySelectorAll('.ant-form-item');
        elements.forEach((element) => {
            const label = element.querySelector('.ant-form-item-label');
            const text = label?.textContent?.toLowerCase() || '';
            if (text.includes(searchQuery)) {
                element.classList.remove('sha-hidden');
            } else {
                element.classList.add('sha-hidden');
            }
        });

        const panels = collapseRef.current?.querySelectorAll('.ant-collapse-item');

        panels?.forEach(panel => {
            const shouldShow = panel.querySelectorAll('.sha-hidden').length === 0;
            shouldShow ? panel.classList.remove('sha-hidden') : panel.classList.add('sha-hidden');
        });

    }, [searchQuery]);

    return (
        <Tabs defaultActiveKey="display" type="card">
            {tabs.map(({ key, tab, content }) => (
                <TabPane tab={tab} key={key} className={key}>
                    <SearchInput onSearch={handleSearch} />
                    <div ref={collapseRef}>{content}</div>
                </TabPane>
            ))}
        </Tabs>
    );
};
