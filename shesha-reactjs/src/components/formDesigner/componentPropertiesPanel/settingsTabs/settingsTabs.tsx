import { useFormDesignerState } from '@/providers/formDesigner';
import { Input, Tabs } from 'antd';
import React, { useState, useEffect, useRef } from 'react';

const { TabPane } = Tabs;

export const SearchInput = ({ onSearch }) => (
    <Input
        placeholder="Search"
        allowClear
        style={{ marginBottom: 10 }}
        onChange={(e) => onSearch(e.target.value.toLowerCase())}
    />
);

export const SettingsTabs = ({ tabs }: { tabs: any[] }) => {

    const { settingsPanelRef } = useFormDesignerState();
    const [searchQuery, setSearchQuery] = useState('');
    const collapseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (settingsPanelRef.current) {
            const formItems = settingsPanelRef.current.querySelectorAll('.ant-form-item');
            const panels = collapseRef.current?.querySelectorAll('.ant-collapse-item');

            formItems.forEach((item) => {
                const label = item.querySelector('.ant-form-item-label')?.textContent?.toLowerCase() || '';
                const isVisible = searchQuery === '' || label.includes(searchQuery);
                item.classList.toggle('sha-hidden', !isVisible);
            });

            panels?.forEach(panel => {
                const visibleItems = panel.querySelectorAll('.ant-form-item:not(.sha-hidden)');
                const isVisible = searchQuery === '' || visibleItems.length > 0;
                panel.classList.toggle('sha-hidden', !isVisible);

                if (isVisible && visibleItems.length > 0) {
                    panel.classList.add('ant-collapse-item-active');
                } else {
                    panel.classList.remove('ant-collapse-item-active');
                }
            });
        }
    }, [searchQuery, settingsPanelRef]);

    return (
        <Tabs defaultActiveKey="display" type="card">
            {tabs.map(({ key, tab, content }) => (
                <TabPane tab={tab} key={key} className={key}>
                    <SearchInput onSearch={setSearchQuery} />
                    <div ref={collapseRef}>{content}</div>
                </TabPane>
            ))}
        </Tabs>
    );
};
