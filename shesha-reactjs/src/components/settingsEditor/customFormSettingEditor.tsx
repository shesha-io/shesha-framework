import { ConfigurableForm } from '@/components/configurableForm';
import { DataTypes } from '@/interfaces/dataTypes';
import React, { FC, useState,
  useEffect,
  useMemo } from 'react';
import { ISettingEditorWithValueProps } from './models';
import { ISettingIdentifier } from './provider/models';
import { useSettingsEditor } from './provider';

import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';

export const CustomFormSettingEditor: FC<ISettingEditorWithValueProps> = (props) => {
  const { selection, value } = props;
  const { setting: configuration } = selection;
  const { editorForm } = configuration;

  const formRef = useShaFormRef();

  const [initialValue, setInitialValue] = useState(value);

  const { setEditor, saveSettingValue, editorMode } = useSettingsEditor();

  const startSave = (): Promise<void> => {
    return formRef.current.validateFields().then(() => {
      const settingId: ISettingIdentifier = {
        name: selection.setting.name,
        module: selection.setting.module,
        appKey: selection.app?.appKey,
      };

      const values = formRef.current.formData;

      const data = selection.setting.dataType === DataTypes.object
        ? { ...values ?? {} }
        : values?.value; // extract scalar value
      delete data._formFields;

      return saveSettingValue(settingId, data)
        .then(() => {
          setInitialValue(data);
        })
        .catch((error) => {
          throw error;
        });
    });
  };

  const cancel = (): void => {
    formRef?.current.setFormData({ values: initialValue, mergeValues: false });
  };

  useEffect(() => {
    setEditor({ save: startSave, cancel });
  }, [selection, initialValue]);

  useEffect(() => {
    setInitialValue(value);
    formRef.current.setInitialValues(value);
    formRef.current.setFormData({ values: value, mergeValues: false });
  }, [value]);

  const initialValues = useMemo(() => {
    const result = selection.setting.dataType === DataTypes.object
      ? initialValue
      : { value: initialValue }; // for scalar types add `value` property
    return result;
  }, [initialValue]);

  return (
    <ConfigurableForm
      mode={editorMode}
      shaFormRef={formRef}
      initialValues={initialValues}
      formId={editorForm}
    />
  );
};
