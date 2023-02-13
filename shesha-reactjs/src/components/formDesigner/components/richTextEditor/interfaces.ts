import { JoditProps } from 'jodit-react';
import { IConfigurableFormComponent } from '../../../../interfaces';

export interface IRichTextEditorProps extends IConfigurableFormComponent {
  placeholder?: string;
  toolbar?: boolean;
  textIcons?: boolean;
  preset?: 'inline';
  toolbarButtonSize?: 'tiny' | 'xsmall' | 'middle' | 'large';
  toolbarStickyOffset?: number;
  theme?: string;
  toolbarSticky?: boolean;
  autofocus?: boolean;
  useSearch?: boolean;
  iframe?: boolean;
  spellcheck?: boolean;
  direction?: 'rtl' | 'ltr';
  enter?: 'P' | 'DIV' | 'BR';
  defaultMode?: '1' | '2' | '3';
  showCharsCounter?: boolean;
  showWordsCounter?: boolean;
  showXPathInStatusbar?: boolean;
  disablePlugins?: string[];
  insertImageAsBase64URI?: boolean;
  // Sizes
  autoHeight?: boolean;
  allowResizeY?: boolean;
  height?: number;
  minHeight?: number;
  maxHeight?: number;

  autoWidth?: boolean;
  allowResizeX?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;

  // State
  saveHeightInStorage?: boolean;
  saveModeInStorage?: boolean;
  askBeforePasteHTML?: boolean;
  askBeforePasteFromWord?: boolean;
}

export interface IJoditProps extends Partial<JoditProps['config']> {
  showCharsCounter?: boolean;
  showWordsCounter?: boolean;
  showXPathInStatusbar?: boolean;
}
