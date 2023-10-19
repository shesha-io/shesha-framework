import { Empty } from 'antd';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableForm } from '../../../components';
import { FormMarkup } from '../../../providers/form/models';
import { useToolbarConfigurator } from '../../../providers/toolbarConfigurator';
import itemGroupSettingsJson from './itemGroupSettings.json';
import itemSettingsJson from './itemSettings.json';

export interface IProps {}

export const ToolbarItemProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useToolbarConfigurator();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);

  const debouncedSave = useDebouncedCallback(
    (_changedValues, values) => {
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
      componentModel.itemType === 'item'
        ? (itemSettingsJson as FormMarkup)
        : componentModel.itemType === 'group'
        ? (itemGroupSettingsJson as FormMarkup)
        : [];
    return (
      <ConfigurableForm
        key={selectedItemId}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode={readOnly ? 'readonly' : 'edit'}
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

  const onSettingsSave = (values) => {
    console.log(values);
  };

  return <>{editor}</>;
};

export default ToolbarItemProperties;
