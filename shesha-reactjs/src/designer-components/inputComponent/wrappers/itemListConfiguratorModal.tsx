import { IItemListConfiguratorModalSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped, FormMarkup } from '@/providers/form/models';
import { ItemListConfiguratorModal } from '@/designer-components/itemListConfigurator/itemListConfiguratorModal';
import { Alert } from 'antd';
import { getFirstNonEmptyStringPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { ListItemWithId } from '@/components/listEditor/models';

const EMPTY_VALUE: ListItemWithId[] = [];

export const ItemListConfiguratorModalWrapper: FCUnwrapped<IItemListConfiguratorModalSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, onAddNewItem, listItemSettingsMarkup, buttonText, buttonTextReadOnly, modalSettings, modalReadonlySettings } = props;
  const activeModalSettings = readOnly ? modalReadonlySettings : modalSettings;
  return (
    <ItemListConfiguratorModal
      value={value ?? EMPTY_VALUE}
      onChange={onChange}
      readOnly={readOnly ?? false}
      initNewItem={onAddNewItem}
      size={size}
      settingsMarkupFactory={() => {
        return {
          components: listItemSettingsMarkup ?? [],
          formSettings: {
            colon: false,
            layout: 'vertical',
            labelCol: { span: 24 },
            wrapperCol: { span: 24 },
          },
        } satisfies FormMarkup;
      }}
      itemRenderer={({ item }) => ({
        ...item,
        label: getFirstNonEmptyStringPropertyOrUndefined(item, ["title", "label", "name"]) ?? "",
        description: getStringPropertyOrUndefined(item, "tooltip"),
      })}
      buttonText={readOnly ? buttonTextReadOnly : buttonText}
      modalSettings={{
        title: activeModalSettings?.title,
        header: activeModalSettings ? <Alert title={activeModalSettings.header} /> : undefined,
      }}
    />
  );
};
