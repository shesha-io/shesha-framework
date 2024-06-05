import groupSettingsJson from './groupSettings.json';
import itemSettingsJson from './itemSettings.json';
import React, {
  FC,
  useMemo,
  useRef,
} from 'react';
import { ConfigurableForm } from '@/components';
import { Empty, Form } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { ConfigurableFormInstance } from '@/interfaces';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';

export interface ISidebarItemPropertiesProps {
  item?: ISidebarMenuItem;
  onChange?: (item: ISidebarMenuItem) => void;
  readOnly: boolean;
}

export const SidebarItemProperties: FC<ISidebarItemPropertiesProps> = ({ item, onChange, readOnly }) => {
  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);

  const debouncedSave = useDebouncedCallback(
    values => {
      onChange?.({ ...item, ...values });
    },
    // delay in ms
    300
  );

  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const editor = useMemo(() => {
    const emptyEditor = null;
    if (!item) return emptyEditor;

    const markup = isSidebarGroup(item)
      ? (groupSettingsJson as FormMarkup)
      : (itemSettingsJson as FormMarkup);
      
    return (
      <SourceFilesFolderProvider folder={`button-${item.id}`}>
        <ConfigurableForm
          //key={selectedItemId} // rerender for each item to initialize all controls
          formRef={formRef}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={markup}
          form={form}
          initialValues={item}
          onValuesChange={debouncedSave}
          className={sheshaStyles.verticalSettingsClass}
        />
      </SourceFilesFolderProvider>
    );
  }, [item]);

  if (!Boolean(item)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? 'Please select a component to view properties' : 'Please select a component to begin editing'} />
      </div>
    );
  }

  return <>{editor}</>;
};