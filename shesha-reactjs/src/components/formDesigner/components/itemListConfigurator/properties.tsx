import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Empty } from 'antd';
import { ConfigurableForm } from '../../..';
import { useDebouncedCallback } from 'use-debounce';
import { useItemListConfigurator } from '../../../../providers';

export interface IItemConfigPropertiesProps { }

export const ItemConfigProperties: FC<IItemConfigPropertiesProps> = ({ }) => {
  const { selectedItemId, getItem, updateItem, itemTypeMarkup, groupTypeMarkup } = useItemListConfigurator();

  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);

  const debouncedSave = useDebouncedCallback(
    values => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300
  );

  useEffect(() => {
    setEditor(getEditor());
  }, [selectedItemId]);

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);

    const markup =
      componentModel.itemType === 'item' ? itemTypeMarkup : componentModel.itemType === 'group' ? groupTypeMarkup : [];
    return (
      <ConfigurableForm
        key={selectedItemId}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode="edit"
        markup={markup}
        onFinish={onSettingsSave}
        initialValues={componentModel}
        onValuesChange={debouncedSave}
      />
    );
  };

  if (!Boolean(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div>
    );
  }

  const onSettingsSave = values => {
    console.log(values);
  };

  return <>{editor}</>;
};

export default ItemConfigProperties;
