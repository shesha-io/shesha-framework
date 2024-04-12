import React, { useEffect, useState } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { CodeSandboxOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { executeScript, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { CodeEditor } from './codeEditor';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ICodeEditorComponentProps, ICodeEditorProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IObjectMetadata } from '@/interfaces/metadata';
import { useFormData } from '@/providers';
import { CodeEditorWithStandardConstants } from './codeEditorWithConstants';
import isDeepEqual from 'fast-deep-equal/react';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';

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

    const { data: formData } = useFormData();

    const metadataBuilderFactory = useMetadataBuilderFactory();
    
    const getAvailableConstantsAsync = (): Promise<IObjectMetadata> => {
      if (!model.availableConstantsExpression)
        return undefined;

      const metadataBuilder = metadataBuilderFactory("baseProperties");
      const result = executeScript<IObjectMetadata>(model.availableConstantsExpression, { data: formData, metadataBuilder });
      return result;
    };

    const [availableConstants, setAvailableConstants] = useState<IObjectMetadata>();
    useEffect(() => {
      if (model.availableConstants){
        setAvailableConstants(model.availableConstants);
      } else {
        getAvailableConstantsAsync()?.then(constants => {
          if (!isDeepEqual(availableConstants, constants)) {
            setAvailableConstants(constants);
          }
        });
      }
    }, [model.availableConstantsExpression, formData]);

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const props: ICodeEditorProps = {
            value: value,
            onChange: onChange,
            language: "typescript",
            ...editorProps,
            mode: model.mode || 'dialog',
            readOnly: model.readOnly
          };
          return availableConstants
            ? <CodeEditor {...props} availableConstants={availableConstants} />
            : <CodeEditorWithStandardConstants {...props} />;
        }
        }
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<ICodeEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ICodeEditorComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ICodeEditorComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ICodeEditorComponentProps>(3, (prev) => ({...prev, language: prev.language ?? "typescript" }))
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