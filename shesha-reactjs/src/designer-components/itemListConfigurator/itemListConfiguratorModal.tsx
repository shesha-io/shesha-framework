import { ListItemWithId } from '@/components/listEditor/models';
import { deepCopyViaJson } from '@/utils/object';
import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import { ItemListConfigurator } from './itemListConfigurator';
import { useMedia } from 'react-use';
import { DefaultItemRenderer, ItemSettingsMarkupFactory } from './interfaces';
import { ListEditorChildrenFn } from '@/components/listEditor';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface ModalSettings {
  title?: string;
  header?: React.ReactNode;
}

export interface IItemListConfiguratorModalProps<TItem extends ListItemWithId> {
  readOnly: boolean;
  value?: TItem[];
  onChange?: (newValue: TItem[]) => void;
  initNewItem: (items: TItem[]) => TItem;
  settingsMarkupFactory: ItemSettingsMarkupFactory<TItem>;
  size?: SizeType;

  buttonText?: string;
  modalSettings?: ModalSettings;
  itemRenderer: ListEditorChildrenFn<TItem> | DefaultItemRenderer<TItem>;
}

export const ItemListConfiguratorModal = <TItem extends ListItemWithId>(props: IItemListConfiguratorModalProps<TItem>): JSX.Element => {
  const {
    value,
    onChange,
    readOnly,
    initNewItem,
    settingsMarkupFactory,
    itemRenderer,
    buttonText,
    modalSettings,
    size,
  } = props;

  const { title, header } = modalSettings ?? {};

  const [showModal, setShowModal] = useState(false);
  const isSmall = useMedia('(max-width: 480px)');

  const [localValue, setLocalValue] = useState<TItem[]>(deepCopyViaJson(value));

  const openModal = (): void => {
    setLocalValue(deepCopyViaJson(value));
    setShowModal(true);
  };

  const onOkClick = (): void => {
    onChange?.(localValue);
    setShowModal(false);
  };

  const onCancelClick = (): void => {
    setShowModal(false);
  };

  return (
    <>
      <Button onClick={openModal} size={size}>{buttonText ?? (readOnly ? 'View Configuration' : 'Edit Configuration')}</Button>
      <Modal
        width={isSmall ? '90%' : '60%'}
        styles={{ body: { height: '80vh' } }}
        open={showModal}
        title={title ?? "Configuration"}
        onCancel={onCancelClick}
        onOk={onOkClick}
        destroyOnHidden={true}
      >
        <ItemListConfigurator
          readOnly={readOnly}
          value={localValue}
          onChange={setLocalValue}
          initNewItem={initNewItem}
          settingsMarkupFactory={settingsMarkupFactory}
          itemRenderer={itemRenderer}
          header={header}
        />
      </Modal>
    </>
  );
};
