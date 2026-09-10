import React from 'react';
import { ExpressionValue } from '../model/types';
import { MustacheExpressionEditor } from './editors/expressionEditor';
import { JavaScriptEditor } from './editors/javaScriptEditor';
import { RequiredToggle } from './editors/requiredToggle';

interface ExpressionValueEditorProps {
  value: ExpressionValue;
  onChange: (value: ExpressionValue) => void;
  readOnly: boolean;
  /** Hide the skip-when-empty toggle, for example on a specification condition. */
  showRequiredToggle: boolean;
}

/** An expression-sourced value: the editor for its language plus the skip-when-empty toggle. */
export const ExpressionValueEditor: React.FC<ExpressionValueEditorProps> = ({ value, onChange, readOnly, showRequiredToggle }) => (
  <div className="sha-query-builder-func-editor">
    <div className="sha-query-builder-func-args">
      <div className="sha-query-builder-func-arg sha-query-builder-control-slot sha-query-builder-func-arg--expression">
        {value.language === 'javascript'
          ? (
            <JavaScriptEditor
              value={value.expression}
              onChange={(expression) => onChange({ ...value, expression })}
              readOnly={readOnly}
            />
          )
          : (
            <MustacheExpressionEditor
              value={value.expression}
              onChange={(expression) => onChange({ ...value, expression })}
              readOnly={readOnly}
            />
          )}
      </div>
      {showRequiredToggle && (
        <div className="sha-query-builder-func-arg sha-query-builder-control-slot sha-query-builder-func-arg--required">
          <RequiredToggle
            required={value.required}
            onChange={(required) => onChange({ ...value, required })}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  </div>
);
