import React, { FC, useMemo } from 'react';
import { Empty } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { ConfigurableForm } from '@/components/configurableForm';
import { ButtonGroupItemProps } from '@/providers';
import { sheshaStyles } from '@/styles';
import { getGroupSettings } from './itemGroupSettings';
import { getItemSettings } from './itemSettings';

export interface IButtonGroupPropertiesProps {
  item?: ButtonGroupItemProps;
  onChange?: (item: ButtonGroupItemProps) => void;
  readOnly: boolean;
}

export const ButtonGroupProperties: FC<IButtonGroupPropertiesProps> = ({ item, onChange, readOnly }) => {
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

    const markup =
      item.itemType === 'item'
        ? (getItemSettings() as FormMarkup)
        : item.itemType === 'group'
          ? (getGroupSettings() as FormMarkup)
          : [];
    return (
      <SourceFilesFolderProvider folder={`button-${item.id}`}>
        <ConfigurableForm
          //key={selectedItemId} // rerender for each item to initialize all controls
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode={readOnly ? 'readonly' : 'edit'}
          markup={markup}
          cacheKey={item.itemType}
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