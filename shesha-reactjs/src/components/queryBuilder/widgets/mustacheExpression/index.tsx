import React from 'react';
import { BasicConfig } from '@react-awesome-query-builder/antd';
import type { BaseWidget, TextFieldSettings } from '@react-awesome-query-builder/antd';
import { ExpressionEditor, buildExpressionContextFromPaths } from '@/components/expressionEditor';
import { buildExpressionContextFromMetadata, mergeExpressionContexts, ExpressionContextTree } from '@/components/expressionEditor/contextMetadata';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useQueryBuilderState } from '@/providers/queryBuilder';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { SheshaConstants } from '@/utils/metadata/standardProperties';

type ExpressionEditorWidgetType = BaseWidget & TextFieldSettings;

interface ExpressionEditorWidgetControlProps {
  value?: string;
  setValue: (value: string) => void;
  readonly?: boolean;
}

const ExpressionEditorWidgetControl: React.FC<ExpressionEditorWidgetControlProps> = ({
  value,
  setValue,
  readonly,
}) => {
  const queryBuilderState = useQueryBuilderState(false);
  const availableConstants = useAvailableConstantsMetadata({
    standardConstants: [
      SheshaConstants.globalState,
      SheshaConstants.pageContext,
      SheshaConstants.contexts,
    ],
  });
  const fieldPaths = React.useMemo(
    () => (queryBuilderState?.fields ?? [])
      .map((field) => field?.propertyName)
      .filter(Boolean),
    [queryBuilderState?.fields],
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
      fieldContext as unknown as ExpressionContextTree,
      (constantsContext ?? {}) as ExpressionContextTree,
    ),
    [constantsContext, fieldContext],
  );

  return (
    <ExpressionEditor
      value={value ?? ''}
      onChange={setValue}
      disabled={readonly}
      context={context}
      className="sha-query-builder-mustache-expression-input"
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
    return <ExpressionEditorWidgetControl value={props.value} setValue={props.setValue} readonly={props.readonly} />;
  },
};

// Backward-compatible alias used by existing query builder config.
export const MustacheExpressionWidget = ExpressionEditorWidget;
