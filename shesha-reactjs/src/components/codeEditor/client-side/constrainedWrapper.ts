import { editor, Range as MonacoRange } from "monaco-editor";
import constrainedEditor, { ConstrainedInstance } from "constrained-editor-plugin";
import { Monaco } from "@monaco-editor/react";

export const constrainedMonaco = (editor: Monaco): ConstrainedInstance => {
  return constrainedEditor(editor);
};

export interface ValueInEditableRanges {
  [key: string]: string;
};

export interface EditableRange {
  allowMultiline: boolean;
  range: MonacoRange;
  originalRange: number[];
};

export interface EditableRangesDictionary {
  [key: string]: EditableRange;
};

export type onChangeCallback = (currentlyChangedContent: ValueInEditableRanges, allValuesInEditableRanges: ValueInEditableRanges, currentEditableRangeObject: EditableRangesDictionary) => void;

export interface ConstrainedTextModel extends editor.ITextModel {
  onDidChangeContentInEditableRange: (callback: onChangeCallback) => void;
}

export const isConstrainedTextModel = (model: editor.ITextModel): model is ConstrainedTextModel => {
  return (model as Partial<ConstrainedTextModel>).onDidChangeContentInEditableRange !== undefined;
};
