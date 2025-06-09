import React, {
  FC,
  useMemo,
} from 'react';
import { Empty } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';
import { ConfigurableForm } from '@/components';
import { getGroupSettings } from './groupSettings';
import { getItemSettings } from './itemSettings';

export interface ISidebarItemPropertiesProps {
  item?: ISidebarMenuItem;
  onChange?: (item: ISidebarMenuItem) => void;
  readOnly: boolean;
}

export const SidebarItemProperties: FC<ISidebarItemPropertiesProps> = ({ item, onChange, readOnly }) => {
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
      ? getGroupSettings(item) as FormMarkup
      : (getItemSettings(item) as FormMarkup);
      
    return (
      <SourceFilesFolderProvider folder={`button-${item.id}`}>
        <ConfigurableForm
          //key={item.id} // rerender for each item to initialize all controls
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={markup}
          cacheKey={isSidebarGroup(item) ? 'group' : 'button'}
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