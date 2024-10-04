import React, { useCallback } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { CodeSandboxOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { executeScript, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { CodeEditor } from './codeEditor';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { ICodeEditorComponentProps, ICodeEditorProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IMetadata, IObjectMetadata } from '@/interfaces/metadata';
import { useFormData, useShaFormInstance } from '@/providers';
import { CodeEditorWithStandardConstants } from './codeEditorWithConstants';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
//import camelcase from 'camelcase';

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
    const metadataBuilderFactory = useMetadataBuilderFactory();
    const { data: formData } = useFormData();
    const shaFormInstance = useShaFormInstance();

    const usePassedConstants = model.availableConstantsExpression;
    const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
      if (!model.availableConstantsExpression)
        return Promise.reject("AvailableConstantsExpression is mandatory");

      const metadataBuilder = metadataBuilderFactory();
      const getConstantsArgs = { 
        data: formData, 
        metadataBuilder,
        form: shaFormInstance,
      };
      return typeof(model.availableConstantsExpression) === 'string'
        ? executeScript<IObjectMetadata>(model.availableConstantsExpression, getConstantsArgs)
        : model.availableConstantsExpression(getConstantsArgs);
    }, [model.availableConstantsExpression, metadataBuilderFactory, formData, shaFormInstance]);

    const resultTypeEvaluator = () => {
      if (!Boolean(model.resultTypeExpression?.trim()))
        return undefined;

      const metadataBuilder = metadataBuilderFactory();

      return executeScript<IMetadata>(model.resultTypeExpression, { 
        data: formData, 
        metadataBuilder,
        form: shaFormInstance,
      });
    };

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

          return usePassedConstants
            ? <CodeEditor {...props} availableConstants={constantsAccessor} resultType={resultTypeEvaluator}/>
            : <CodeEditorWithStandardConstants {...props} resultType={resultTypeEvaluator}/>;
        }
        }
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<ICodeEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ICodeEditorComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<ICodeEditorComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ICodeEditorComponentProps>(3, (prev) => ({ ...prev, language: prev.language ?? "typescript" }))
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