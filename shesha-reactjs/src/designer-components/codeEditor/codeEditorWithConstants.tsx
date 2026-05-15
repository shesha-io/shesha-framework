import React, { FC } from 'react';
import { CodeEditor } from './codeEditor';
import { ICodeEditorProps } from './interfaces';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/hooks';

export interface ICodeEditorWithStandardConstantsProps extends ICodeEditorProps {
  makeComponentsNullable?: boolean;
}

export const CodeEditorWithStandardConstants: FC<ICodeEditorWithStandardConstantsProps> = (props) => {
  const standardConstants = useAvailableStandardConstantsMetadata(props.makeComponentsNullable);
  return (
    <CodeEditor {...props} availableConstants={standardConstants} />
  );
};
