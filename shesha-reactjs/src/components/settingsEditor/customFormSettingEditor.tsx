import { ConfigurableForm } from '@/components/configurableForm';
import { DataTypes } from '@/interfaces/dataTypes';
import React, { FC, useState,
  useEffect,
  useMemo } from 'react';
import { ISettingEditorWithValueProps } from './models';
import { ISettingIdentifier } from './provider/models';
import { useSettingsEditor } from './provider';

import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';
import { unsafeGetValueByPropertyName } from '@/utils/object';
import { isDefined } from '@/utils/nullables';

const settingValueToFormValues = (value: unknown, dataType: string): object => {
  return dataType === DataTypes.object
    ? typeof (value) === "object" && isDefined(value) ? value : {}
    : { value: value }; // for scalar types add `value` property
};

export const CustomFormSettingEditor: FC<ISettingEditorWithValueProps> = (props) => {
  const { selection, value } = props;
  const { setting: configuration } = selection;
  const { editorForm } = configuration;

  const formRef = useShaFormRef();

  const [initialValue, setInitialValue] = useState(value);

  const { setEditor, saveSettingValue, editorMode } = useSettingsEditor();

  const startSave = (): Promise<void> => {
    const formInstance = formRef.current;
    if (!isDefined(formInstance))
      return Promise.reject("No form ref");

    return formInstance.validateFields().then(() => {
      const settingId: ISettingIdentifier = {
        name: selection.setting.name,
        module: selection.setting.module,
        appKey: selection.app?.appKey,
      };

      const values = formInstance.formData ?? {};

      const data = selection.setting.dataType === DataTypes.object
        ? { ...values }
        : unsafeGetValueByPropertyName(values, "value"); // extract scalar value
      if (isDefined(data) && typeof (data) === "object" && "_formFields" in data)
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
    if (isDefined(formRef.current)) {
      const fixedInitialValue = settingValueToFormValues(initialValue, selection.setting.dataType);
      formRef.current.setFormData({ values: fixedInitialValue, mergeValues: false });
    }
  };

  useEffect(() => {
    setEditor({ save: startSave, cancel });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, initialValue]);

  useEffect(() => {
    setInitialValue(value);
    const formInstance = formRef.current;
    if (isDefined(formInstance)) {
      const fixedValue = settingValueToFormValues(value, selection.setting.dataType);

      formInstance.setInitialValues(fixedValue);
      formInstance.setFormData({ values: fixedValue, mergeValues: false });
    }
  }, [formRef, selection.setting.dataType, value]);

  const initialValues = useMemo(() => {
    return settingValueToFormValues(initialValue, selection.setting.dataType);
  }, [initialValue, selection.setting.dataType]);

  return isDefined(editorForm)
    ? (
      <ConfigurableForm
        mode={editorMode ?? "readonly"}
        shaFormRef={formRef}
        initialValues={initialValues}
        formId={editorForm}
      />
    )
    : undefined;
};
