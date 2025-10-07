import { Editor, Monaco } from '@monaco-editor/react';
import React, { FC, useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import { ConstrainedInstance, TextRange } from './utils';
import { ValueInEditableRanges, constrainedMonaco, isConstrainedTextModel } from './constrainedWrapper';
import { IHasCodeTemplate, IMonacoEditorProps } from '../models';

export interface IConstrainedCodeEditorProps extends IMonacoEditorProps, IHasCodeTemplate {

}

const WRAPPED_CODE_RANGE = "originalCode";

/**
 * Code editor constrained according ot he provided template.
 *
 * @param {IConstrainedCodeEditorProps} props - the props for the component
 * @return {JSX.Element} the constrained code editor component
 */
export const ConstrainedCodeEditor: FC<IConstrainedCodeEditorProps> = (props) => {
  const {
    value,
    onChange,
    template,
    onMount: baseOnMount,
    ...restEditorProps
  } = props;
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();
  const constrainedInstanceRef = useRef<ConstrainedInstance>();

  const unwrappedCode = useRef<string>(value);
  const restrictions = useRef([]);

  const onDidChangeContentInEditableRange = (currentlyChangedContent: ValueInEditableRanges): void => {
    const newCode = currentlyChangedContent[WRAPPED_CODE_RANGE];
    unwrappedCode.current = newCode;
    onChange(newCode);
  };

  const updateRestrictions = (constrainedInstance: ConstrainedInstance, model: editor.ITextModel, ranges: TextRange[]): void => {
    constrainedInstance.removeRestrictionsIn(model);
    restrictions.current = ranges
      ? ranges.map((range) => ({
        label: WRAPPED_CODE_RANGE,
        range: [range.start.line, range.start.column, range.end.line, range.end.column],
        allowMultiline: true,
      }))
      : [];
    if (ranges)
      constrainedInstance.addRestrictionsTo(model, restrictions.current);
  };

  const initWrapper = (value: string): void => {
    const editor = editorRef.current;

    const templateResponse = template(value);
    const model = editor.getModel();
    model.setValue(templateResponse.content);

    updateRestrictions(constrainedInstanceRef.current, model, templateResponse.editableRanges);

    if (isConstrainedTextModel(model))
      model.onDidChangeContentInEditableRange(onDidChangeContentInEditableRange);
  };

  useEffect(() => {
    if (value !== unwrappedCode.current) {
      initWrapper(value);
    }
  }, [value]);

  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco): void => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const constrainedInstance = constrainedMonaco(monaco);
    constrainedInstanceRef.current = constrainedInstance;

    constrainedInstance.initializeIn(editor);

    initWrapper(value);

    if (baseOnMount)
      baseOnMount(editor, monaco);
  };

  return (
    <Editor
      onMount={onMount}
      {...restEditorProps}
    />
  );
};
