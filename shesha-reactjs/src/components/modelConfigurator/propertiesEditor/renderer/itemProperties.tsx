import propertySettingsJson from './propertySettings.json';
import React, {
  FC,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import { ConfigurableForm } from '../../..';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import { Empty, Form } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { nanoid } from '@/utils/uuid';
import { useDebouncedCallback } from 'use-debounce';
import { usePropertiesEditor } from '../provider';

export interface IProps { }

export const ToolbarItemProperties: FC<IProps> = () => {
  const { selectedItemId, getItem, updateItem } = usePropertiesEditor();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const [form] = Form.useForm();

  const formRef = useRef<ConfigurableFormInstance>(null);

  const debouncedSave = useDebouncedCallback(
    values => {
      updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300
  );

  useEffect(() => {
    const values = getItem(selectedItemId);
    form.setFieldsValue(values);
  }, [editor]);

  const getEditor = () => {
    const emptyEditor = null;
    if (!selectedItemId) return emptyEditor;

    const componentModel = getItem(selectedItemId);
    //form.setFieldsValue(componentModel);

    const markup = propertySettingsJson as FormMarkup;

    return (
      <>
        <ConfigurableForm
          key={nanoid()}
          size="small"
          formRef={formRef}
          layout="horizontal"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          mode="edit"
          markup={markup}
          form={form}
          initialValues={componentModel}
          onValuesChange={debouncedSave}
        />
      </>
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

export default ToolbarItemProperties;
