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
  const { mode, language, availableConstantsExpression, resultTypeExpression, value, readOnly, description, label, propertyName, onChange, templateSettings, wrapInTemplate } = props;
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
  const formInstance = useShaFormInstance();
  const formData = formInstance.formData;
  const metadataBuilderFactory = useMetadataBuilderFactory();
  const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
    if (!availableConstantsExpression?.trim())
      return Promise.reject("AvailableConstantsExpression is mandatory");

    const metadataBuilder = metadataBuilderFactory();

    return executeScript<IObjectMetadata>(availableConstantsExpression, { data: formData, metadataBuilder });
  }, [availableConstantsExpression, metadataBuilderFactory, formData]);

  const resultTypeAccessor = useCallback((): Promise<IObjectMetadata> | undefined => {
    if (!resultTypeExpression || (typeof resultTypeExpression === 'string' && !resultTypeExpression.trim()))
      return undefined;

    const metadataBuilder = metadataBuilderFactory();
    if (typeof resultTypeExpression === 'string')
      return executeScript<IObjectMetadata>(resultTypeExpression, { data: formData, metadataBuilder });
    if (typeof resultTypeExpression === 'function')
      return resultTypeExpression({ data: formData, metadataBuilder, form: formInstance }) as Promise<IObjectMetadata>;
    return undefined;
  }, [resultTypeExpression, metadataBuilderFactory, formInstance, formData]);

  // TODO: move to wrapper, add `constantsAccessor`
  return getEditor(availableConstantsExpression, codeEditorProps, constantsAccessor, resultTypeAccessor);
};
