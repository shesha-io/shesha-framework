import { ListItemWithId } from '@/components/listEditor/models';
import { ItemPropertiesRendererProps } from '@/components/listEditorWithPropertiesPanel';
import { ConfigurableFormInstance } from '@/interfaces';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';
import { Form } from 'antd';
import React, { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ItemSettingsMarkupFactory } from './interfaces';
import { ConfigurableForm } from '@/components/configurableForm';

export interface IPropertiesPanelProps<TItem extends ListItemWithId> extends ItemPropertiesRendererProps<TItem> {
  settingsMarkupFactory: ItemSettingsMarkupFactory<TItem>;
}

export const PropertiesPanel = <TItem extends ListItemWithId>(props: IPropertiesPanelProps<TItem>): React.JSX.Element => {
  const { item, onChange, readOnly, settingsMarkupFactory } = props;

  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance<TItem>>(undefined);

  const debouncedSave = useDebouncedCallback(
    (values) => {
      onChange({ ...item, ...values } as TItem);
    },
    // delay in ms
    300,
  );

  const markup = settingsMarkupFactory(item);
  return (
    <SourceFilesFolderProvider folder={`item-${item.id}`}>
      <ConfigurableForm<TItem>
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
};
