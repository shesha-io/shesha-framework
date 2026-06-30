import React, {
  FC,
  useMemo,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { sheshaStyles } from '@/styles';
import { getGroupSettings } from './groupSettings';
import { getItemSettings } from './itemSettings';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { ConfigurableForm } from '@/components/configurableForm';
import { OnFormValuesChangeHandler } from '@/components/configurableForm/models';

export interface ISidebarItemPropertiesProps {
  item: ISidebarMenuItem;
  onChange: (item: ISidebarMenuItem) => void;
  readOnly: boolean;
}

export const SidebarItemProperties: FC<ISidebarItemPropertiesProps> = ({ item, onChange, readOnly }) => {
  const debouncedSave = useDebouncedCallback<OnFormValuesChangeHandler<ISidebarMenuItem>>(
    (values) => {
      onChange({ ...item, ...values });
    },
    // delay in ms
    300,
  );

  const fbf = useFormBuilderFactory();

  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const editor = useMemo(() => {
    const markup = isSidebarGroup(item)
      ? getGroupSettings({ fbf })
      : getItemSettings({ fbf });

    return (
      <SourceFilesFolderProvider folder={`button-${item.id}`}>
        <ConfigurableForm
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
  }, [debouncedSave, fbf, item, readOnly]);

  return <>{editor}</>;
};
