import { FC, RefObject, useMemo } from 'react';
import { Modal } from 'antd';
import { ConfigurableForm } from '@/components/configurableForm';
import { useFormDesigner, useFormDesignerSettings } from '@/providers/formDesigner';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';
import { getFormSettingsFormMarkup } from './formSettings';
import { useFormViaFactory } from '@/form-factory/hooks';
import { ISetFormDataPayload } from '@/providers/form/contexts';
import { IShaFormInstance } from '@/providers/form/store/interfaces';
import { FormMarkup, getOwnFormLayoutSettings, OwnFormSettings, resolveFormLayout } from '@/providers/form/models';
import DefaultModelProvider, { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { useThemeState } from '@/providers/theme';
import { deepMergeValues } from '@/utils/object';
import { IFormSettings } from '../..';

export interface IFormSettingsEditorProps {
  isVisible: boolean;
  close: () => void;
  readOnly: boolean;
}

interface IFormSettingsFormProps {
  readOnly: boolean;
  markup: FormMarkup;
  settings: OwnFormSettings;
  shaFormRef: RefObject<IShaFormInstance<IFormSettings> | undefined>;
  onSave: (settings: IFormSettings) => void;
}

/**
 * Form Settings bound to the default model, the same way as the component properties panel: each layout
 * input shows the theme's value as inherited until it is overridden, and can be reset back to it.
 */
const FormSettingsForm: FC<IFormSettingsFormProps> = ({ readOnly, markup, settings, shaFormRef, onSave }) => {
  const defaultModel = useDefaultModelActionsOrUndefined<IFormSettings>();

  const getMergedOrValue = (payload: ISetFormDataPayload<IFormSettings>, _instance: IShaFormInstance<IFormSettings>): IFormSettings => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data ? deepMergeValues(data, values) : values;
  };

  return (
    <ConfigurableForm<IFormSettings>
      layout="vertical"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      className="sha-form-settings-editor"
      shaFormRef={shaFormRef}
      // The submitted data has the inherited values merged in; save only the form's own.
      onFinish={(values) => onSave(defaultModel?.getModel() ?? values)}
      markup={markup}
      initialValues={settings}
      isSettingsForm
      dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
    />
  );
};

export const FormSettingsEditor: FC<IFormSettingsEditorProps> = ({ isVisible, close, readOnly }) => {
  const formSettings = useFormDesignerSettings();
  const { updateFormSettings } = useFormDesigner();
  const { formProps } = useFormPersister();
  const formRef = useShaFormRef<IFormSettings>();
  const formSettingsMarkup = useFormViaFactory(getFormSettingsFormMarkup);
  const { theme } = useThemeState();

  // What the layout inputs inherit when the form does not set them: the theme's Form Span settings.
  const themeLayout = useMemo((): Partial<IFormSettings> => {
    const { layout, labelCol, wrapperCol, colon } = resolveFormLayout(undefined, theme);
    return { layout, labelCol, wrapperCol, colon: colon ?? true };
  }, [theme]);

  // A form on the built-in default layout inherits it, so it shows as inherited rather than overridden.
  const ownSettings = useMemo(() => getOwnFormLayoutSettings(formSettings), [formSettings]);

  const onSave = (values: IFormSettings): void => {
    if (!readOnly) {
      updateFormSettings(values);
      close();
    }
  };

  const sourcesFolder = formProps ? `/forms/${formProps.module}/${formProps.name}` : "";

  return (
    <Modal
      open={isVisible}
      title="Form Settings"
      width="clamp(590px, 50vw, 800px)" // min 320px, preferred 50vw, max 700px
      onOk={() => {
        formRef.current?.submit();
      }}
      okButtonProps={{ hidden: readOnly }}
      // Remount on open so the default model starts from the saved settings, not the last edit.
      destroyOnHidden

      onCancel={close}
      cancelText={readOnly ? 'Close' : undefined}
    >
      <SourceFilesFolderProvider folder={sourcesFolder}>
        <DefaultModelProvider<Partial<IFormSettings>> name="Theme" model={ownSettings} defaultModel={themeLayout}>
          <FormSettingsForm
            readOnly={readOnly}
            markup={formSettingsMarkup}
            settings={ownSettings}
            shaFormRef={formRef}
            onSave={onSave}
          />
        </DefaultModelProvider>
      </SourceFilesFolderProvider>
    </Modal>
  );
};
