import * as React from 'react';
import { ExpressionEditor, buildExpressionContextFromPaths } from '@/components/expressionEditor';
import { buildExpressionContextFromMetadata, mergeExpressionContexts } from '@/components/expressionEditor/contextMetadata';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useQueryBuilderState } from '@/providers/queryBuilder';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

// hoisted: a fresh array each render re-triggers the metadata hook and loops.
// The current script API: application.state, page.state, form.state and the signed-in user.
const EXPRESSION_STANDARD_CONSTANTS = [
  SheshaConstants.application,
  SheshaConstants.page,
  SheshaConstants.form,
  SheshaConstants.user,
];

interface MustacheExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}

export const MustacheExpressionEditor: React.FC<MustacheExpressionEditorProps> = ({ value, onChange, readOnly }) => {
  const { fields } = useQueryBuilderState();
  const availableConstants = useAvailableConstantsMetadata({ standardConstants: EXPRESSION_STANDARD_CONSTANTS });
  const fieldPaths = React.useMemo(
    () => fields.map((field) => field.propertyName).filter(isNotNullOrWhiteSpace),
    [fields],
  );
  const fieldContext = React.useMemo(() => buildExpressionContextFromPaths(fieldPaths), [fieldPaths]);
  const constantsContext = useAsyncMemo(() => buildExpressionContextFromMetadata(availableConstants), [availableConstants], {});
  const context = React.useMemo(() => mergeExpressionContexts(fieldContext, constantsContext ?? {}), [constantsContext, fieldContext]);

  return (
    <ExpressionEditor
      value={value}
      onChange={onChange}
      disabled={readOnly}
      context={context}
      className="sha-query-builder-mustache-expression-input"
      controlClassName="sha-query-builder-mustache-expression-control"
      placeholder="Expression"
      inline
      allowExpand
    />
  );
};
