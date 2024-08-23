import { Input, Tabs } from 'antd';
import React, { useCallback, useRef } from 'react';

export const useSearch = (settingsPanelRef) => {
    return useCallback((e: React.ChangeEvent<HTMLInputElement>, active: string) => {
        if (settingsPanelRef?.current === undefined) return null;
        const searchQuery = e.target.value.toLowerCase();
        const activePanel = settingsPanelRef?.current?.querySelector(`.${active}`);

        if (activePanel) {
            activePanel.querySelectorAll('.ant-form-item-label').forEach((label) => {
                const labelText = label.textContent?.toLowerCase() || '';
                label.parentElement.style.display = labelText.includes(searchQuery) ? 'block' : 'none';
            });
        }
    }, [settingsPanelRef]);
};

export const SearchInput = ({ group, ref }) => {
    const search = useSearch(ref);
    return <Input
        placeholder="Search"
        allowClear
        style={{ marginBottom: 10 }}
        onChange={(e) => search(e, group)}
    />
};

const { TabPane } = Tabs;

export const renderTabs = (tabs, ref) => (
        <Tabs defaultActiveKey="display" type='card'>
            {tabs.map(({ key, tab, content }) => (
                <TabPane tab={tab} key={key} className={key}>
                    <SearchInput group={tab.tab} ref={ref} />
                    {content}
                </TabPane>
            ))}
        </Tabs>);