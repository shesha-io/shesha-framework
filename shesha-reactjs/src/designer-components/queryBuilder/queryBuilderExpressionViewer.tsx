import { CodeEditor } from '@/components/codeEditor/codeEditor';
import React, { FC } from 'react';

export interface IQueryBuilderExpressionViewerProps {
  value?: object;
}

export const QueryBuilderExpressionViewer: FC<IQueryBuilderExpressionViewerProps> = (props) => {
  return (
    <CodeEditor
      readOnly={true}
      value={props.value ? JSON.stringify(props.value, null, 2) : ''}
      language="javascript"
    />
  );
};

export default QueryBuilderExpressionViewer;
