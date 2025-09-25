import { editor, Range as MonacoRange } from "monaco-editor";
import constrainedEditor from "constrained-editor-plugin";
import { Monaco } from "@monaco-editor/react";
import { ConstrainedInstance } from "./utils";

export const constrainedMonaco = (editor: Monaco): ConstrainedInstance => {
  return constrainedEditor(editor);
};

export interface ValueInEditableRanges {
  [key: string]: string;
};

export interface EditableRange {
  allowMultiline: Boolean;
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
  return (model as ConstrainedTextModel).onDidChangeContentInEditableRange !== undefined;
};
