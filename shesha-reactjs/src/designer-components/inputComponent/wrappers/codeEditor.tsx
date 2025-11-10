import { ICodeEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FC, useCallback } from 'react';
import camelcase from 'camelcase';
import { ICodeEditorProps } from '@/designer-components/codeEditor/interfaces';
import { IObjectMetadata } from '@/interfaces';
import { executeScript } from '@/providers/form/utils/scripts';
import { useShaFormInstance } from '@/providers';
import { useMetadataBuilderFactory } from '@/utils';
import { getEditor } from '../utils';
import { defaultExposedVariables } from '@/designer-components/_settings/settingsControl';

export const CodeEditorWrapper: FC<ICodeEditorSettingsInputProps> = (props) => {
  const { mode, language, availableConstantsExpression, value, readOnly, description, label, propertyName, onChange, templateSettings, wrapInTemplate } = props;
  const functionName = `get${camelcase(label ?? propertyName, { pascalCase: true })}`;

  const codeEditorProps: ICodeEditorProps = {
    readOnly: readOnly,
    description: description,
    mode: mode ?? 'dialog',
    language: language ?? 'typescript',
    fileName: propertyName,
    label: label ?? propertyName,
    wrapInTemplate: wrapInTemplate ?? true,
    value: value,
    onChange: onChange,
    templateSettings: templateSettings ?? { functionName: functionName },
    exposedVariables: defaultExposedVariables,
  };
  const { formData } = useShaFormInstance();
  const metadataBuilderFactory = useMetadataBuilderFactory();
  const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
    if (!availableConstantsExpression?.trim())
      return Promise.reject("AvailableConstantsExpression is mandatory");

    const metadataBuilder = metadataBuilderFactory();

    return executeScript<IObjectMetadata>(availableConstantsExpression, { data: formData, metadataBuilder });
  }, [availableConstantsExpression, metadataBuilderFactory, formData]);

  // TODO: move to wrapper, add `constantsAccessor`
  return getEditor(availableConstantsExpression, codeEditorProps, constantsAccessor);
};
