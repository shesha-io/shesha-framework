import { ListItemWithId } from '@/components/listEditor/models';
import { ItemPropertiesRendererProps } from '@/components/listEditorWithPropertiesPanel';
import { ConfigurableFormInstance } from '@/interfaces';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';
import { Empty, Form } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ItemSettingsMarkupFactory } from './interfaces';
import { ConfigurableForm } from '@/components/configurableForm';

export interface IPropertiesPanelProps<TItem extends ListItemWithId> extends ItemPropertiesRendererProps<TItem> {
  settingsMarkupFactory: ItemSettingsMarkupFactory<TItem>;
}

export const PropertiesPanel = <TItem extends ListItemWithId>(props: IPropertiesPanelProps<TItem>): JSX.Element => {
  const { item, onChange, readOnly, settingsMarkupFactory } = props;

  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);

  // Use a ref to always have access to the latest item value
  const itemRef = useRef<TItem>(item);
  itemRef.current = item;

  const debouncedSave = useDebouncedCallback(
    (_changedValues, values) => {
      // Use the ref to get the latest item value, avoiding stale closure issues
      // Use the full form snapshot (values) to avoid losing updates
      onChange?.({ ...itemRef.current, ...values });
    },
    // delay in ms
    300,
  );
    //Guard debounced saves when switching items to prevent applying stale values to new items
    useEffect(() => {
        debouncedSave.cancel();
    }, [item?.id, debouncedSave]);

  const editor = useMemo(() => {
    const emptyEditor = null;
    if (!item) return emptyEditor;

    const markup = settingsMarkupFactory(item) ?? [];
    return (
      <SourceFilesFolderProvider folder={`item-${item.id}`}>
        <ConfigurableForm
          // key={selectedItemId} // rerender for each item to initialize all controls
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
  }, [item, settingsMarkupFactory, readOnly, form, debouncedSave]);

  return Boolean(item)
    ? (<>{editor}</>)
    : (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'} />
      </div>
    );
};