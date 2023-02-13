import React, { FC } from 'react';
import { CodeEditor } from '../../..';

export interface IQueryBuilderExpressionViewerProps {
  value?: object;
}

export const QueryBuilderExpressionViewer: FC<IQueryBuilderExpressionViewerProps> = props => {

  return (
    <CodeEditor
          width="100%"
          readOnly={true}
          value={props.value ? JSON.stringify(props.value, null, 2) : ''}
          mode="json"
          theme="monokai"
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
            autoScrollEditorIntoView: true,
            minLines: 3,
            maxLines: 100,
          }}
        />
  );
};

export default QueryBuilderExpressionViewer;
