import { IItemListConfiguratorModalSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ItemListConfiguratorModal } from '@/designer-components/itemListConfigurator/itemListConfiguratorModal';
import { Alert } from 'antd';

export const ItemListConfiguratorModalWrapper: FCUnwrapped<IItemListConfiguratorModalSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, onAddNewItem, listItemSettingsMarkup, buttonText, buttonTextReadOnly, modalSettings, modalReadonlySettings } = props;
  return (
    <ItemListConfiguratorModal
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      initNewItem={onAddNewItem}
      size={size}
      settingsMarkupFactory={() => {
        return {
          components: listItemSettingsMarkup,
          formSettings: {
            colon: false,
            layout: 'vertical',
            labelCol: { span: 24 },
            wrapperCol: { span: 24 },
          },
        };
      }}
      itemRenderer={({ item }) => ({
        ...item,
        label: item.title || item.label || item.name,
        description: item.tooltip,
      })}
      buttonText={readOnly ? buttonTextReadOnly : buttonText}
      modalSettings={{
        title: readOnly ? modalReadonlySettings.title : modalSettings.title,
        header: <Alert title={readOnly ? modalReadonlySettings.header : modalSettings.header} />,
      }}
    />
  );
};
