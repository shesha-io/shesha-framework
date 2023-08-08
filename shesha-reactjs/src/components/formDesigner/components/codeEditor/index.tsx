import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { CodeSandboxOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { CodeEditor } from './codeEditor';
import { DataTypes, StringFormats } from '../../../../interfaces/dataTypes';
import { ICodeEditorComponentProps, ICodeEditorProps } from './interfaces';
import { useForm } from '../../../..';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const CodeEditorComponent: IToolboxComponent<ICodeEditorComponentProps> = {
  type: 'codeEditor',
  name: 'Code Editor',
  icon: <CodeSandboxOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && (dataFormat === StringFormats.javascript || dataFormat === StringFormats.json),
  factory: ({ ...model }: ICodeEditorComponentProps) => {
    const editorProps: ICodeEditorProps = {
      ...model,
    };

    const { formMode} = useForm();

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
                setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
                readOnly={formMode === 'readonly'}
              />
            );
          }}
        </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<ICodeEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
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
