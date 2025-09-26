import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { CodeSandboxOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { CodeEditor } from './codeEditor';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ICodeEditorComponentProps, ICodeEditorProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { CodeEditorWithStandardConstants } from './codeEditorWithConstants';
import { useResultTypeEvaluator } from './hooks/useResultType';
import { useConstantsEvaluator } from './hooks/useConstantsEvaluator';
import { Environment } from '@/publicJsApis/metadataBuilder';

const settingsForm = settingsFormJson as FormMarkup;

const CodeEditorComponent: IToolboxComponent<ICodeEditorComponentProps> = {
  type: 'codeEditor',
  name: 'Code Editor',
  icon: <CodeSandboxOutlined />,
  isInput: true,
  isOutput: true,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && (dataFormat === StringFormats.javascript || dataFormat === StringFormats.json),
  Factory: ({ model }) => {
    const editorProps: ICodeEditorProps = {
      ...model as any,
    };
    const constantsEvaluator = useConstantsEvaluator({ availableConstantsExpression: model.availableConstantsExpression });

    const resultType = useResultTypeEvaluator({ resultTypeExpression: model.resultTypeExpression });

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const props: ICodeEditorProps = {
            value: value,
            onChange: onChange,
            language: "typescript",
            ...editorProps,
            mode: model.mode || 'dialog',
            readOnly: model.readOnly,
          };

          return Boolean(constantsEvaluator)
            ? <CodeEditor {...props} availableConstants={constantsEvaluator} resultType={resultType} />
            : <CodeEditorWithStandardConstants {...props} resultType={resultType} />;
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<ICodeEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ICodeEditorComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ICodeEditorComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ICodeEditorComponentProps>(3, (prev) => ({ ...prev, language: prev.language ?? "typescript" }))
    .add<ICodeEditorComponentProps>(4, (prev) => ({ ...prev, environment: prev.environment ?? (prev.language === "typescript" ? Environment.FrontEnd : Environment.None) })),
  initModel: (model) => {
    const textAreaModel: ICodeEditorComponentProps = {
      ...model,
      label: 'Code Editor',
      mode: 'dialog',
    };

    return textAreaModel;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default CodeEditorComponent;
