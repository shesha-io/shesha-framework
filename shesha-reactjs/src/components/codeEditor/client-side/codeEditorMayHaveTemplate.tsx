import React, { FC } from 'react';
import { IMonacoEditorProps, IHasCodeTemplate } from '../models';
import { ConstrainedCodeEditor } from './constrainedCodeEditor';
import { Editor } from '@monaco-editor/react';
import { CodeEditorLoadingProgressor } from '../loadingProgressor';

export interface ICodeEditorMayHaveTemplateProps extends IMonacoEditorProps, Partial<IHasCodeTemplate> {
}

/**
 * Code editor with optional template support.
 * If template is provided, it will be used to render the editor.
 * If template is not provided, the editor will be rendered as usual.
 *
 * @param {ICodeEditorMayHaveTemplateProps} template - the template to be passed to the ConstrainedCodeEditor or Editor component
 * @param {...restProps} restProps - any other props to be passed to the ConstrainedCodeEditor or Editor component
 * @return {JSX.Element} the rendered ConstrainedCodeEditor or Editor component
 */
export const CodeEditorMayHaveTemplate: FC<ICodeEditorMayHaveTemplateProps> = ({ template, ...restProps }) => {
  return template
    ? <ConstrainedCodeEditor {...restProps} template={template} loading={<CodeEditorLoadingProgressor />} />
    : <Editor {...restProps} loading={<CodeEditorLoadingProgressor />} />;
};
