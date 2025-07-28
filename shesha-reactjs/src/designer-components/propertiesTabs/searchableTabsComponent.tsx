import React, { useState } from 'react';
import { Tabs, Input, Empty } from 'antd';
import ParentProvider from '@/providers/parentProvider';
import { ComponentsContainer } from '@/components';
import { useStyles } from './style';
import { SearchOutlined } from '@ant-design/icons';
import { filterDynamicComponents } from './utils';
import { ITabsComponentProps } from './models';
import { useFormState, useFormActions } from '@/providers/form';
import { useShaFormDataUpdate } from '@/providers/form/providers/shaFormProvider';

interface SearchableTabsProps {
    model: ITabsComponentProps;
}

const SearchableTabs: React.FC<SearchableTabsProps> = ({ model }) => {
    const { tabs } = model;
    const [searchQuery, setSearchQuery] = useState('');
    const { styles } = useStyles();

    const formState = useFormState(false);
    const formActions = useFormActions(false);

    useShaFormDataUpdate();


    const isComponentHidden = (component) => {
        if (formState.name === "modalSettings") {
            if (component.inputs) {

                const visibleInputs = component.inputs.filter(input => {
                    if (!input.propertyName) return true;
                    return formActions.isComponentFiltered(input);
                });

                if (visibleInputs.length === 0) {
                    return false;
                }

                component.inputs = visibleInputs;

                return visibleInputs.length > 0;
            }

            return formActions.isComponentFiltered(component);
        } else {
            return true;
        }
    };

    const newFilteredTabs = tabs
        .map((tab: any) => {
            const filteredComponents = tab.children ?? filterDynamicComponents(tab.components, searchQuery);

            const visibleComponents = Array.isArray(filteredComponents)
                ? filteredComponents.filter(comp => isComponentHidden(comp))
                : filteredComponents;

            const hasVisibleComponents = Array.isArray(visibleComponents)
                ? visibleComponents.length > 0
                : !!visibleComponents;

            return {
                ...tab,
                label: tab.label ?? tab.title,
                components: visibleComponents,
                children: visibleComponents.length === 0
                    ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Properties not found" />
                    : <ParentProvider model={model}>
                        <ComponentsContainer
                            containerId={tab.id + tab.key}
                            dynamicComponents={visibleComponents} />
                    </ParentProvider>,
                forceRender: true,
                hidden: tab.hidden || !hasVisibleComponents
            };
        })
        .filter(tab => !tab.hidden);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
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
            {newFilteredTabs.length === 0 && searchQuery ?
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Property Not Found" /> :
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