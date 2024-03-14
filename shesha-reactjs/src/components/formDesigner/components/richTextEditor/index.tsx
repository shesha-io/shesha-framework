import React from 'react';
import RichTextEditor from '@/components/richTextEditor';
import settingsFormJson from './settingsForm.json';
import { ConfigurableFormItem } from '../../..';
import { EditOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle } from '@/providers/form/utils';
import { IJoditEditorProps } from '../../../richTextEditor/joditEditor';
import { IRichTextEditorProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { useDeepCompareMemoKeepReference } from '@/hooks';
import { useFormData } from '@/providers';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';

const settingsForm = settingsFormJson as FormMarkup;

type PartialRichTextEditorConfig = Partial<IJoditEditorProps['config']>;

const RichTextEditorComponent: IToolboxComponent<IRichTextEditorProps> = {
  type: 'richTextEditor',
  name: 'Rich Text Editor',
  icon: <EditOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();

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
        readonly: model?.readOnly,
        style: getStyle(model?.style, formData),
        defaultActionOnPaste: 'insert_as_html',
        enter: model?.enter || 'br',
        editHTMLDocumentMode: false,
        enterBlock: 'div',
        colorPickerDefaultTab: 'color',
        allowResizeX:model?.allowResizeX && !model?.autoWidth,
        allowResizeY:model?.allowResizeY && !model?.autoHeight,
        autofocus: model?.autofocus,
      };
      return typedConfig;
    }, [model, model.readOnly]);
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
    .add<IRichTextEditorProps>(1, (prev) => migrateReadOnly(prev))
  ,
};

export default RichTextEditorComponent;
