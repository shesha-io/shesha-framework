import React, {
  FC,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ConfigurableForm } from '../../..';
import { Empty } from 'antd';
import { nanoid } from '@/utils/uuid';
import { useDebouncedCallback } from 'use-debounce';
import { usePropertiesEditor } from '../provider';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';
import { getSettings } from './propertySettings/propertySettings';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { useModelConfigurator } from '@/providers/modelConfigurator';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { OnFormValuesChangeHandler } from '@/components/configurableForm/models';
import { RecursivePartial } from '@/interfaces/entity';
import { isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

export const ToolbarItemProperties: FC = () => {
  const { selectedItemId, getItem, updateItem } = usePropertiesEditor();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);
  const formRef = useShaFormRef<IModelItem>();
  const components = useFormDesignerComponents();
  const fbf = useFormBuilderFactory();
  const modelConfigurator = useModelConfigurator();

  const debouncedSave = useDebouncedCallback<OnFormValuesChangeHandler<IModelItem>>(
    (_, values) => {
      if (isNotNullOrWhiteSpace(selectedItemId))
        updateItem({ id: selectedItemId, settings: values });
    },
    // delay in ms
    300,
  );

  // update form values since the property data can be changed in the provider
  const currentItem: IModelItem | undefined = isNotNullOrWhiteSpace(selectedItemId) ? getItem(selectedItemId) : undefined;
  useDeepCompareEffect(() => {
    if (currentItem)
      formRef.current?.setFieldsValue(currentItem as RecursivePartial<IModelItem>);
  }, [currentItem]);

  useEffect(() => {
    const getEditor = (): ReactNode => {
      const emptyEditor = null;
      if (isNullOrWhiteSpace(selectedItemId)) return emptyEditor;

      const componentModel = getItem(selectedItemId);

      const markup = getSettings(fbf, components, modelConfigurator.modelConfiguration);

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
            initialValues={componentModel}
            onValuesChange={debouncedSave}
          />
        </div>
      );
    };

    setEditor(getEditor());
  // to avoid unneded re-creating form (form should be created only when selectedItemId change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, debouncedSave, fbf, formRef, selectedItemId]);

  if (isNullOrWhiteSpace(selectedItemId)) {
    return (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div>
    );
  }

  return <>{editor}</>;
};
