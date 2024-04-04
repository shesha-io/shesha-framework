import React, { FC } from 'react';
import { CodeEditor } from './codeEditor';
import { ICodeEditorProps } from './interfaces';
import { useAvailableConstantsStandard } from '@/utils/metadata/useAvailableConstants';

export const CodeEditorWithStandardConstants: FC<ICodeEditorProps> = (props) => {
    const standardConstants = useAvailableConstantsStandard();
    return (
        <CodeEditor {...props} availableConstants={standardConstants}/>
      );
};