import React, { FC } from 'react';
import { ICodeEditorProps, IHasCodeTemplate } from './models';
import { ConstrainedCodeEditor } from './constrainedCodeEditor';
import { Editor } from '@monaco-editor/react';

export interface IJavascriptEditorProps extends ICodeEditorProps, Partial<IHasCodeTemplate>  {
}

export const JavascriptEditor: FC<IJavascriptEditorProps> = ({ template, ...restProps }) => {
    return template
        ? <ConstrainedCodeEditor {...restProps} template={template} />
        : <Editor {...restProps} />;
};