import React from 'react';
import { BasicConfig } from '@react-awesome-query-builder/antd';
import type { BaseWidget, TextFieldSettings } from '@react-awesome-query-builder/antd';
import { ExpressionEditor, buildExpressionContextFromPaths } from '@/components/expressionEditor';
import { useQueryBuilderState } from '@/providers/queryBuilder';

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
  const fieldPaths = React.useMemo(
    () => (queryBuilderState?.fields ?? [])
      .map((field) => field?.propertyName)
      .filter(Boolean),
    [queryBuilderState?.fields],
  );
  const context = React.useMemo(
    () => buildExpressionContextFromPaths(fieldPaths),
    [fieldPaths],
  );

  return (
    <div style={{ width: '100%' }}>
      <ExpressionEditor
        value={value ?? ''}
        onChange={setValue}
        disabled={readonly}
        context={context}
        className="sha-query-builder-mustache-expression-input"
        placeholder="Expression"
      />
    </div>
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
