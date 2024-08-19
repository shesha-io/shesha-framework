import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import { Empty, Input, Tabs } from 'antd';
import { useFormDesignerState } from '@/providers/formDesigner';

export interface IProps { }

const ComponentPropertiesPanelInner: FC<IProps> = () => {
  const { selectedComponentId, readOnly, settingsPanelRef } = useFormDesignerState();
  const [activeKey, setActiveKey] = useState('1');
  const [tabItems, setTabItems] = useState<{ label: string; key: string; children: React.ReactNode }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const hideOtherPanels = useCallback(() => {
    if (!settingsPanelRef?.current) return;

    const panels = settingsPanelRef.current.querySelectorAll('.settings-group');

    panels.forEach((panel, index) => {
      const panelKey = (index + 1).toString();
      if (panelKey === activeKey) {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.position = 'static';
        panel.style.width = 'auto';
        panel.style.height = 'auto';
        panel.style.overflow = 'auto';
      } else {
        panel.style.display = 'block';
        panel.style.visibility = 'hidden';
        panel.style.position = 'absolute';
        panel.style.width = '0';
        panel.style.height = '0';
        panel.style.overflow = 'hidden';
      }
    });

  }, [activeKey, settingsPanelRef]);

  const search = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    const activePanel = settingsPanelRef.current.querySelector(`.settings-group:nth-child(${activeKey})`);

    if (activePanel) {
      activePanel.querySelectorAll('.ant-form-item-label').forEach((label) => {
        if (label.textContent?.toLowerCase().includes(searchQuery.toLowerCase())) {
          label.parentElement.style.display = 'block';
        } else {
          label.parentElement.style.display = 'none';
        }
      });
    }
  }, [activeKey, settingsPanelRef]);

  const getTabs = useCallback(() => {
    if (!settingsPanelRef?.current || !selectedComponentId) return;

    const newTabItems: { label: string; key: string; children: React.ReactNode }[] = [];

    settingsPanelRef.current.querySelectorAll('.settings-group').forEach((panel, index) => {
      const key = (index + 1).toString();
      const label = panel.classList[1].split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      newTabItems.push({
        label,
        key,
        children: (
          <>
            <Input placeholder="Search properties..." onChange={search} />
            <div className="panel-content" ref={panel} />
          </>
        ),
      });
    });

    setTabItems(newTabItems);
  }, [selectedComponentId, settingsPanelRef, search]);

  useEffect(() => {
    getTabs();
    hideOtherPanels();
  }, [selectedComponentId, getTabs, hideOtherPanels]);

  return (
    <>
      {selectedComponentId ? (
        tabItems.length > 0 ? (
          <Tabs
            type="card"
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key);
              hideOtherPanels();
            }}
            items={tabItems}
          />
        ) : null
      ) : (
        <Empty
          description={
            readOnly
              ? "Please select a component to view settings"
              : "Please select a component to begin editing"
          }
        />
      )}
      <div ref={containerRef}>
        <div ref={settingsPanelRef} />
      </div>
    </>
  );
};

export const ComponentPropertiesPanel = React.memo(ComponentPropertiesPanelInner);
