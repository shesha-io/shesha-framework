import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import RichTextEditor from '@/components/richTextEditor';
import { IJoditEditorProps } from '@/components/richTextEditor/joditEditor';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { useDeepCompareMemoKeepReference } from '@/hooks';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { useForm, useFormData } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { EditOutlined } from '@ant-design/icons';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './formSettings';
import { IRichTextEditorProps } from './interfaces';
import { defaultStyles } from './utils';

type PartialRichTextEditorConfig = Partial<IJoditEditorProps['config']>;

// Works around a Jodit bug where it saves the mode as a number but its own restore-on-init logic only accepts a string, so it can never restore a mode it saved itself.
const joditCamelCase = (key: string): string => key.replace(/([-_])(.)/g, (_m, _sep, letter: string) => letter.toUpperCase());

const readPersistedJoditMode = (editorId: string): number | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const rootKey = `Jodit_${editorId}`;
    const raw = window.localStorage.getItem(rootKey);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as Record<string, unknown>;
    const value = stored[joditCamelCase(`${rootKey}jodit_default_mode`)];
    return typeof value === 'number' ? value : undefined;
  } catch {
    return undefined;
  }
};

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
    const editorId = `sha-rte-${model.id}`;

    const config = useDeepCompareMemoKeepReference<PartialRichTextEditorConfig>(() => {
      const persistedMode = model.saveModeInStorage ? readPersistedJoditMode(editorId) : undefined;
      const typedConfig: PartialRichTextEditorConfig = {
        toolbar: model.toolbar ?? false,
        ...(model.preset ? { preset: model.preset } : {}),
        textIcons: model.textIcons ?? false,
        ...(model.toolbarButtonSize ? { toolbarButtonSize: model.toolbarButtonSize } : {}),
        theme: typeof model.theme === 'string' ? model.theme : 'default',
        iframe: model.iframe ?? false,
        ...(model.direction ? { direction: model.direction } : {}),
        disablePlugins: (model.disablePlugins || []).join(','),
        spellcheck: model.spellcheck ?? false,
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
        saveModeInStorage: model.saveModeInStorage ?? false,
        ...(persistedMode !== undefined ? { defaultMode: persistedMode } : {}),
        uploader: { insertImageAsBase64URI: model.insertImageAsBase64URI ?? false },
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
            id={`sha-rte-${model.id}`}
            config={config}
            value={value ?? undefined}
            onChange={onChange}
            autoWidth={model.autoWidth}
            autoHeight={model.autoHeight}
            allowBase64Images={model.insertImageAsBase64URI ?? false}
            style={{
              // Only min/max here - Jodit's own inner container already applies height/width itself, and this wrapper shrink-wraps to it via CSS.
              ...(!model.autoHeight && { minHeight, maxHeight }),
              ...(!model.autoWidth && { minWidth, maxWidth }),
            }}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,

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
          allowResizeX: prev.allowResizeX ?? true,
          allowResizeY: prev.allowResizeY ?? true,
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IRichTextEditorProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),

};

export default RichTextEditorComponent;
