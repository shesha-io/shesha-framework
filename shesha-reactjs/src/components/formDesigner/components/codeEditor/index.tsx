import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { CodeSandboxOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { CodeEditor } from './codeEditor';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ICodeEditorComponentProps, ICodeEditorProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useAvailableConstantsStandard } from '@/utils/metadata/useAvailableConstants';

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
      ...model,
    };
    // todo: replace with metadata editor
    const availableConstants = useAvailableConstantsStandard();

    return (
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            return (
              <CodeEditor
                value={value}
                onChange={onChange}
                language="typescript"
                {...editorProps}
                mode={model.mode || 'dialog'}
                readOnly={model.readOnly}
                availableConstants={availableConstants}
              />
            );
          }}
        </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<ICodeEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ICodeEditorComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ICodeEditorComponentProps>(2, (prev) => migrateReadOnly(prev))
  ,
  initModel: model => {
    const textAreaModel: ICodeEditorComponentProps = {
      ...model,
      label: 'Code Editor',
      mode: 'dialog',
    };

    return textAreaModel;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default CodeEditorComponent;
