import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { CodeSandboxOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { CodeEditor } from './codeEditor';
import { DataTypes, StringFormats } from '../../../../interfaces/dataTypes';
import { ICodeEditorProps } from './models';
import { ICodeExposedVariable } from '../../../codeVariablesTable';
import { useForm } from '../../../..';

const settingsForm = settingsFormJson as FormMarkup;

export interface ICodeEditorComponentProps extends IConfigurableFormComponent {
  mode?: 'dialog' | 'inline';
  exposedVariables?: ICodeExposedVariable[];
}

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

    const { formMode } = useForm();

    return (
      <>
        <ConfigurableFormItem model={model}>
          <CodeEditor
            language="typescript"
            {...editorProps}
            mode={model.mode || 'dialog'}
            setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
            readOnly={formMode === 'readonly'}
          />
        </ConfigurableFormItem>
      </>
    );
  },
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
