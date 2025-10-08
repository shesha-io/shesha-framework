import { ListItemWithId } from '@/components/listEditor/models';
import { ItemPropertiesRendererProps } from '@/components/listEditorWithPropertiesPanel';
import { ConfigurableFormInstance } from '@/interfaces';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';
import { Empty, Form } from 'antd';
import React, { useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ItemSettingsMarkupFactory } from './interfaces';
import { ConfigurableForm } from '@/components';

export interface IPropertiesPanelProps<TItem extends ListItemWithId> extends ItemPropertiesRendererProps<TItem> {
  settingsMarkupFactory: ItemSettingsMarkupFactory<TItem>;
}

export const PropertiesPanel = <TItem extends ListItemWithId>(props: IPropertiesPanelProps<TItem>): JSX.Element => {
  const { item, onChange, readOnly, settingsMarkupFactory } = props;

  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);

  const debouncedSave = useDebouncedCallback(
    (values) => {
      onChange?.({ ...item, ...values });
    },
    // delay in ms
    300,
  );

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
  }, [item]);

  return Boolean(item)
    ? (<>{editor}</>)
    : (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'} />
      </div>
    );
};
