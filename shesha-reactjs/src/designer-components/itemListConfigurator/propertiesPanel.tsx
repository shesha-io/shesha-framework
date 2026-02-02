import { ListItemWithId } from '@/components/listEditor/models';
import { ItemPropertiesRendererProps } from '@/components/listEditorWithPropertiesPanel';
import { ConfigurableFormInstance } from '@/interfaces';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';
import { Empty, Form } from 'antd';
import React, { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ItemSettingsMarkupFactory } from './interfaces';
import { FormWithRawMarkup } from '@/components/configurableForm/formWithRawMarkup';

export interface IPropertiesPanelProps<TItem extends ListItemWithId> extends ItemPropertiesRendererProps<TItem> {
    settingsMarkupFactory: ItemSettingsMarkupFactory<TItem>;
}

export const PropertiesPanel = <TItem extends ListItemWithId>(props: IPropertiesPanelProps<TItem>) => {
    const { item, onChange, readOnly, settingsMarkupFactory } = props;

    const [form] = Form.useForm();

    const formRef = useRef<ConfigurableFormInstance>(null);

    // Use a ref to always have access to the latest item value
    const itemRef = useRef<TItem>(item);
    itemRef.current = item;

    const debouncedSave = useDebouncedCallback(
        values => {
            // Use the ref to get the latest item value, avoiding stale closure issues
            onChange?.({ ...itemRef.current, ...values });
        },
        // delay in ms
        300
    );

    if (!item) {
        return (
            <div>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'} />
            </div>
        );
    }

    const markup = settingsMarkupFactory(item) ?? [];

    return (
        <SourceFilesFolderProvider folder={`item-${item.id}`}>
            <FormWithRawMarkup
                key={item.id} // Force remount only when switching between different items
                formRef={formRef}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                mode={readOnly ? 'readonly' : 'edit'}
                markup={markup}
                form={form}
                initialValues={item}
                onValuesChange={debouncedSave}
                className={sheshaStyles.verticalSettingsClass}
                isSettingsForm={true}
            />
        </SourceFilesFolderProvider>
    );
};
