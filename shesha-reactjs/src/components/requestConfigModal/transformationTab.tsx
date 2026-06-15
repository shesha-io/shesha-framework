import React, { FC, useCallback } from 'react';
import { Space, Switch, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { CodeEditor as BaseCodeEditor } from '@/components/codeEditor/codeEditor';
import { IResponseTransformationConfiguration } from './models';
import { validateTransformationScript } from './transformationRunner';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { IObjectMetadataBuilder } from '@/utils/metadata/metadataBuilder';
import { DataTypes } from '@/interfaces';
import { useStyles } from './styles';

const { Text } = Typography;

// The transformation returns an arbitrary value, so the editor's wrapper should read
// `async (): Promise<any>`. Without this it defaults to `Promise<void>`, which makes Monaco flag
// `return { ... }` as "not assignable to type 'void'". Stable reference so the editor environment
// isn't rebuilt each render.
const RESULT_TYPE = { dataType: DataTypes.any };

const DEFAULT_SCRIPT = `return {
    fullName: response.firstName + " " + response.lastName,
    email: response.email
};`;

export interface ITransformationTabProps {
  value?: IResponseTransformationConfiguration | undefined;
  onChange: (value: IResponseTransformationConfiguration) => void;
}

export const TransformationTab: FC<ITransformationTabProps> = ({ value, onChange }) => {
  const { styles } = useStyles();

  const enabled = value?.enabled ?? false;
  const script = value?.script ?? '';

  // Declares the variables the script editor exposes for IntelliSense. We expose the standard
  // Shesha constants (globalState, pageContext, http, moment, form, data, selectedRow, etc. — the
  // same set as every other code editor) plus `response`, the raw API response being transformed.
  // These mirror what `useApiCallAction` provides at runtime via `useAvailableConstantsData`.
  // `response` is typed `any` because its shape is dynamic. `onBuild` is memoised so the editor
  // environment isn't rebuilt on every render.
  const onBuildConstants = useCallback((builder: IObjectMetadataBuilder) => {
    builder.addAny('response', 'The raw API response returned by this call');
  }, []);
  const availableConstants = useAvailableConstantsMetadata({ addGlobalConstants: true, onBuild: onBuildConstants });

  const update = (changes: Partial<IResponseTransformationConfiguration>): void => {
    onChange({ enabled, script, ...changes });
  };

  const handleEnabledChange = (checked: boolean): void => {
    // Seed an example the first time it is enabled with an empty script, for convenience.
    update({ enabled: checked, script: checked && !script.trim() ? DEFAULT_SCRIPT : script });
  };

  const handleScriptChange = (next: string): void => {
    update({ script: next ?? '' });
  };

  const scriptValidation = enabled ? validateTransformationScript(script) : null;

  return (
    <div className={styles.bodyEditor}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <Switch checked={enabled} onChange={handleEnabledChange} />
          <Text strong>Enable Transformation</Text>
          <Tooltip title="Reshape the API response before it's used. The response is available as `response`, plus standard constants (globalState, pageContext, http, form, data). Return the transformed value.">
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', cursor: 'help' }} />
          </Tooltip>
        </Space>

        {enabled && (
          <div>
            <Text type="secondary">Transformation script</Text>
            <div className={styles.codeEditorWrapper}>
              <BaseCodeEditor
                value={script}
                onChange={(v) => handleScriptChange(v ?? '')}
                language="javascript"
                placeholder={DEFAULT_SCRIPT}
                fileName="expression"
                wrapInTemplate
                templateSettings={{ useAsyncDeclaration: true, functionName: 'transformResponse' }}
                availableConstants={availableConstants}
                resultType={RESULT_TYPE}
                style={{ height: 280 }}
              />
            </div>
            {scriptValidation && <div className={styles.jsonError}>{scriptValidation}</div>}
          </div>
        )}
      </Space>
    </div>
  );
};
