import React from 'react';
import { EditOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '../../..';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { FormMarkup } from '@/providers/form/models';
import settingsFormJson from './settingsForm.json';
import RichTextEditor from '@/components/richTextEditor';
import { useDeepCompareMemoKeepReference, useFormData } from '@/components/..';
import { IRichTextEditorProps } from './interfaces';
import { getStyle } from '@/providers/form/utils';
import { IJoditEditorProps } from '../../../richTextEditor/joditEditor';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

type PartialRichTextEditorConfig = Partial<IJoditEditorProps['config']>;

const RichTextEditorComponent: IToolboxComponent<IRichTextEditorProps> = {
  type: 'richTextEditor',
  name: 'Rich Text Editor',
  icon: <EditOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();

    const disabled =model.disabled;

    const readOnly = model.readOnly;

    const config = useDeepCompareMemoKeepReference<PartialRichTextEditorConfig>(() => {
      const typedConfig: PartialRichTextEditorConfig = {
        toolbar: model?.toolbar,
        preset: model?.preset,
        textIcons: model?.textIcons,
        toolbarButtonSize: model?.toolbarButtonSize,
        theme: model?.theme,
        iframe: model?.iframe,
        direction: model?.direction,
        disablePlugins: model?.disablePlugins?.join(',') || '',
        height: model?.height,
        width: model?.width,
        placeholder: model?.placeholder,
        readonly: readOnly || disabled,
        style: getStyle(model?.style, formData),
        defaultActionOnPaste: 'insert_as_html',
        enter: 'br',
        editHTMLDocumentMode: false,
        enterBlock: 'div',
        colorPickerDefaultTab: 'color',
        allowResizeX:model?.allowResizeX && !model?.autoWidth,
        allowResizeY:model?.allowResizeY && !model?.autoHeight,
        autofocus: model?.autofocus,
      };
      return typedConfig;
    }, [model, readOnly]);
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <RichTextEditor config={config} value={value} onChange={onChange}/>}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    ...model,
    placeholder: 'Start writing text....',
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: true,
    height: 200,
    minHeight: 200,
    minWidth: 200,
    toolbar: true,
    useSearch: true,
    autoHeight: true,
    autoWidth: true,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    disablePlugins: null,
  }),
  migrator: (m) => m
    .add<IRichTextEditorProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default RichTextEditorComponent;
