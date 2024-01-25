import groupSettingsJson from './groupSettings.json';
import itemSettingsJson from './itemSettings.json';
import React, {
  FC,
  ReactNode,
  useEffect,
  useState
} from 'react';
import { ConfigurableForm } from '@/components';
import { Empty } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';

export interface IProps { }

export const ToolbarItemProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem } = useSidebarMenuConfigurator();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);

  const debouncedSave = useDebouncedCallback(
    values => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300
  );

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);

    //const markup = itemSettingsJson as FormMarkup;
    const markup =
      componentModel.itemType === 'group' ? (groupSettingsJson as FormMarkup) : (itemSettingsJson as FormMarkup);
    return (
      <ConfigurableForm
        key={selectedItemId}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode="edit"
        markup={markup}
        initialValues={componentModel}
        onValuesChange={debouncedSave}
      />
    );
  };

  useEffect(() => {
    const currentEditor = getEditor();
    setEditor(currentEditor);
  }, [selectedItemId]);

  if (!Boolean(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div>
    );
  }

  return <>{editor}</>;
};

export default ToolbarItemProperties;
