import React from 'react';
import RichTextEditor from '@/components/richTextEditor';
import settingsFormJson from './settingsForm.json';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { EditOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle } from '@/providers/form/utils';
import { IJoditEditorProps } from '@/components/richTextEditor/joditEditor';
import { IRichTextEditorProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { useDeepCompareMemoKeepReference } from '@/hooks';
import { useForm, useFormData } from '@/providers';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './formSettings';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

const settingsForm = settingsFormJson as FormMarkup;

type PartialRichTextEditorConfig = Partial<IJoditEditorProps['config']>;

const RichTextEditorComponent: IToolboxComponent<IRichTextEditorProps> = {
  type: 'richTextEditor',
  name: 'Rich Text Editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { allStyles } = model;
    const { width, height, minWidth, minHeight, maxWidth, maxHeight } = allStyles?.dimensionsStyles ?? {};

    const { formMode } = useForm();


    const config = useDeepCompareMemoKeepReference<PartialRichTextEditorConfig>(() => {
      const typedConfig: PartialRichTextEditorConfig = {
        toolbar: model.toolbar ?? false,
        ...(model.preset ? { preset: model.preset } : {}),
        textIcons: model.textIcons ?? false,
        ...(model.toolbarButtonSize ? { toolbarButtonSize: model.toolbarButtonSize } : {}),
        theme: typeof model.theme === 'string' ? model.theme : 'default',
        iframe: model.iframe ?? false,
        ...(model.direction ? { direction: model.direction } : {}),
        disablePlugins: [...(model.disablePlugins || []), 'spellcheck'].join(','),
        placeholder: model.placeholder ?? '',
        readonly: model.readOnly ?? false,
        style: getStyle(model.style, formData),
        defaultActionOnPaste: 'insert_as_html',
        enter: model.enter ?? 'br',
        editHTMLDocumentMode: false,
        ...(!model.autoHeight && { height: height ?? "", minHeight: minHeight ?? "", maxHeight: maxHeight ?? "" }),
        ...(!model.autoWidth && { width: width ?? "", minWidth: minWidth ?? "", maxWidth: maxWidth ?? "" }),
        enterBlock: 'div',
        colorPickerDefaultTab: 'color',
        allowResizeX: model.allowResizeX === true && !model.autoWidth,
        allowResizeY: model.allowResizeY === true && !model.autoHeight,
        askBeforePasteHTML: model.askBeforePasteHTML ?? false,
        askBeforePasteFromWord: model.askBeforePasteFromWord ?? false,
        autofocus: formMode === 'designer' ? false : model.autofocus ?? false,
        showCharsCounter: model.showCharsCounter ?? false,
        showWordsCounter: model.showWordsCounter ?? false,
      };
      return typedConfig;
    }, [model, formData, formMode]);

    const rerenderKey = `${model.placeholder || ''}-${model.placeholder || false}`;

    return (
      <ConfigurableFormItem<string> model={model} autoAlignLabel={false} key={rerenderKey}>
        {(value, onChange) => (
          <RichTextEditor
            config={config}
            value={value ?? undefined}
            onChange={onChange}
            style={{
              ...(!model.autoHeight && { height, minHeight, maxHeight }),
              ...(!model.autoWidth && { width, minWidth, maxWidth }),
            }}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => ({
    ...model,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: true,
    minHeight: 200,
    minWidth: 200,
    toolbar: true,
    useSearch: true,
    autoHeight: true,
    autoWidth: true,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
  }),
  migrator: (m) =>
    m
      .add<IRichTextEditorProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IRichTextEditorProps>(1, (prev) => migrateReadOnly(prev))
      .add<IRichTextEditorProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IRichTextEditorProps>(3, (prev) => {
        const styles = {
          style: prev.style,
          theme: prev.theme,
          autoHeight: prev.autoHeight ?? true,
          autoWidth: prev.autoWidth ?? true,
        };
        const resize = {
          allowResizeX: true,
          allowResizeY: true,
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles }, ...resize };
      })
      .add<IRichTextEditorProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),

};

export default RichTextEditorComponent;
