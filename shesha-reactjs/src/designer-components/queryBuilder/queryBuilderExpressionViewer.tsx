import { CodeEditor } from '@/components/codeEditor/codeEditor';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/hooks';
import React, { FC } from 'react';

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface IQueryBuilderExpressionViewerProps {
  value?: JsonValue | undefined;
}

export const QueryBuilderExpressionViewer: FC<IQueryBuilderExpressionViewerProps> = (props) => {
  const availableConstants = useAvailableStandardConstantsMetadata();

  return (
    <CodeEditor
      readOnly={true}
      value={props.value === undefined ? '' : JSON.stringify(props.value, null, 2)}
      language="typescript"
      fileName="queryExpression"
      wrapInTemplate={true}
      templateSettings={{
        functionName: 'executeScriptAsync',
        useAsyncDeclaration: true,
      }}
      availableConstants={availableConstants}
    />
  );
};

export default QueryBuilderExpressionViewer;
