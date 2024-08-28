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
        const panels = collapseRef.current?.querySelectorAll('.ant-collapse-item');
        panels?.forEach(panel => {
            const panelHeader = panel.querySelector('.ant-collapse-header') as HTMLElement;
            const panelContent = panel.querySelector('.ant-collapse-content') as HTMLElement;
            console.log(panelContent);
            const elements = panelContent.querySelectorAll('.ant-form-item');
            elements.forEach((element) => {
                const label = element.querySelector('.ant-form-item-label');
                const text = label?.textContent?.toLowerCase() || '';
                if (text.includes(searchQuery)) {
                    element.classList.remove('sha-hidden');
                } else {
                    element.classList.add('sha-hidden');
                }
            });
            if (panelContent) {
                panelContent.style.display = 'block';
            }

            if (panelHeader) {
                panelHeader.setAttribute('aria-expanded', 'true');
            }

            panel.classList.add('ant-collapse-item-active');
        });

        const elements = settingsPanelRef.current.querySelectorAll('.ant-form-item');
        elements.forEach((element) => {
            const label = element.querySelector('.ant-form-item-label');
            const text = label?.textContent?.toLowerCase() || '';
            if (text.includes(searchQuery)) {
                element.classList.remove('sha-hidden');
            } else {
                element.classList.add('sha-hidden');
            }
        });

        panels?.forEach(panel => {
            const shouldShow = panel.querySelectorAll('.sha-hidden').length === 0;
            shouldShow ? panel.classList.remove('sha-hidden') : panel.classList.add('sha-hidden');
        });

    }, [searchQuery]);

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
