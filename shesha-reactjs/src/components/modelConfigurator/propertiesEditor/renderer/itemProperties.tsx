import propertySettingsJson from './propertySettings.json';
import React, {
  FC,
  ReactNode,
  useEffect,
  useState
} from 'react';
import { ConfigurableForm } from '../../..';
import { Empty } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { nanoid } from '@/utils/uuid';
import { useDebouncedCallback } from 'use-debounce';
import { usePropertiesEditor } from '../provider';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';

export interface IProps { }

export const ToolbarItemProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem } = usePropertiesEditor();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const formRef = useShaFormRef();

  const debouncedSave = useDebouncedCallback(
    values => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300
  );

  useEffect(() => {
    const values = getItem(selectedItemId);
    formRef.current?.setFieldsValue(values);
  }, [editor]);

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);

    const markup = propertySettingsJson as FormMarkup;

    return (
      <div>
        <ConfigurableForm
          key={nanoid()}
          size="small"
          layout="horizontal"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode="edit"
          markup={markup}
          shaFormRef={formRef}
          initialValues={{...componentModel, minLength: componentModel.minLength === 0 || !componentModel.minLength ? "0" : componentModel.minLength}} // to force re-rendering of minLength field when 0 is set
          onValuesChange={debouncedSave}
        />
      </div>
    );
  };

  useEffect(() => {
    setEditor(getEditor());
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