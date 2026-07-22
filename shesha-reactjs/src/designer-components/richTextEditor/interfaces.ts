import { IConfigurableFormComponent } from '@/interfaces';

export interface IRichTextEditorProps extends IConfigurableFormComponent {
  placeholder?: string | undefined;
  toolbar?: boolean | undefined;
  textIcons?: boolean | undefined;
  preset?: 'inline' | undefined;
  toolbarButtonSize?: 'tiny' | 'xsmall' | 'middle' | 'large' | undefined;
  toolbarStickyOffset?: number | undefined;
  theme?: string | undefined;
  toolbarSticky?: boolean | undefined;
  autofocus?: boolean | undefined;
  useSearch?: boolean | undefined;
  iframe?: boolean | undefined;
  spellcheck?: boolean | undefined;
  direction?: 'rtl' | 'ltr' | undefined;
  enter?: 'p' | 'div' | 'br' | undefined;
  defaultMode?: '1' | '2' | '3' | undefined;
  showCharsCounter?: boolean | undefined;
  showWordsCounter?: boolean | undefined;
  showXPathInStatusbar?: boolean | undefined;
  disablePlugins?: string[] | undefined;
  insertImageAsBase64URI?: boolean | undefined;
  // Sizes
  autoHeight?: boolean | undefined;
  allowResizeY?: boolean | undefined;
  height?: number | undefined;
  minHeight?: number | undefined;
  maxHeight?: number | undefined;

  autoWidth?: boolean | undefined;
  allowResizeX?: boolean | undefined;
  width?: number | undefined;
  minWidth?: number | undefined;
  maxWidth?: number | undefined;

  // State
  saveHeightInStorage?: boolean | undefined;
  saveModeInStorage?: boolean | undefined;
  askBeforePasteHTML?: boolean | undefined;
  askBeforePasteFromWord?: boolean | undefined;
}
