import React, { FC } from 'react';
import { CodeEditor } from './codeEditor';
import { ICodeEditorProps } from './interfaces';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/useAvailableConstants';

export const CodeEditorWithStandardConstants: FC<ICodeEditorProps> = (props) => {
    const standardConstants = useAvailableStandardConstantsMetadata();
    return (
        <CodeEditor {...props} availableConstants={standardConstants}/>
      );
};