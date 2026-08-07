import React from 'react';
import { BasicConfig } from '@react-awesome-query-builder/antd';
import type { TextWidget, TextFieldSettings } from '@react-awesome-query-builder/antd';
import { ExpressionEditor, buildExpressionContextFromPaths } from '@/components/expressionEditor';
import { buildExpressionContextFromMetadata, mergeExpressionContexts } from '@/components/expressionEditor/contextMetadata';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useQueryBuilderState } from '@/providers/queryBuilder';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

type ExpressionEditorWidgetType = TextWidget & TextFieldSettings;

// Hoisted: as an inline literal this array is a new reference every render, which invalidates the
// `useAvailableConstantsMetadata` memo, then `useAsyncMemo`'s deps, whose resolved value is also a
// fresh object — so it sets state on every render and the editor never stops re-rendering.
const EXPRESSION_STANDARD_CONSTANTS = [
  SheshaConstants.globalState,
  SheshaConstants.pageContext,
  SheshaConstants.contexts,
];

interface ExpressionEditorWidgetControlProps {
  value?: string | undefined;
  setValue: (value: string) => void;
  readOnly: boolean;
}

const ExpressionEditorWidgetControl: React.FC<ExpressionEditorWidgetControlProps> = ({
  value,
  setValue,
  readOnly,
}) => {
  const { fields } = useQueryBuilderState();
  const availableConstants = useAvailableConstantsMetadata({
    standardConstants: EXPRESSION_STANDARD_CONSTANTS,
  });
  const fieldPaths = React.useMemo(
    () => (fields)
      .map((field) => field.propertyName)
      .filter(isNotNullOrWhiteSpace),
    [fields],
  );
  const fieldContext = React.useMemo(
    () => buildExpressionContextFromPaths(fieldPaths),
    [fieldPaths],
  );
  const constantsContext = useAsyncMemo(
    () => buildExpressionContextFromMetadata(availableConstants),
    [availableConstants],
    {},
  );
  const context = React.useMemo(
    () => mergeExpressionContexts(
      fieldContext,
      constantsContext ?? {},
    ),
    [constantsContext, fieldContext],
  );

  return (
    <ExpressionEditor
      value={value ?? ''}
      onChange={setValue}
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

export const ExpressionEditorWidget: ExpressionEditorWidgetType = {
  ...BasicConfig.widgets.text,
  valueSrc: 'value',
  factory: (props) => {
    return <ExpressionEditorWidgetControl value={props.value ?? undefined} setValue={props.setValue} readOnly={props.readonly ?? false} />;
  },
};

// Backward-compatible alias used by existing query builder config.
export const MustacheExpressionWidget = ExpressionEditorWidget;
