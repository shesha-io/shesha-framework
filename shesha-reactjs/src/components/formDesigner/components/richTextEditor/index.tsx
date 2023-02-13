import React from 'react';
import { EditOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '../../..';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { IToolboxComponent } from '../../../../interfaces/formDesigner';
import { FormMarkup } from '../../../../providers/form/models';
import settingsFormJson from './settingsForm.json';
import RichTextEditor from '../../../richTextEditor';
import { useForm } from '../../../..';
import { IRichTextEditorProps } from './interfaces';
import { getStyle } from '../../../../providers/form/utils';
import { IJoditEditorProps } from '../../../richTextEditor/joditEditor';

const settingsForm = settingsFormJson as FormMarkup;

const RichTextEditorComponent: IToolboxComponent<IRichTextEditorProps> = {
  type: 'richTextEditor',
  name: 'Rich Text Editor',
  icon: <EditOutlined />,
  factory: ({ ...model }: IRichTextEditorProps) => {
    const { formMode, isComponentDisabled, formData } = useForm();

    const disabled = isComponentDisabled(model);

    const readOnly = formMode === 'readonly' || model.readOnly;

    const config: Partial<IJoditEditorProps['config']> = {
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
      readonly: readOnly || disabled,
      style: getStyle(model?.style, formData),

      defaultActionOnPaste: 'insert_as_html',
      enter: 'br',
      editHTMLDocumentMode: false,
      enterBlock: 'div',
      colorPickerDefaultTab: 'color',
    };

    return (
      <ConfigurableFormItem model={model}>
        <RichTextEditor config={config} />
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
};

export default RichTextEditorComponent;
