import React, { ReactElement, ReactNode, useCallback } from 'react';
import { getPropertySettingsFromValue } from './utils/utils';
import { useStyles } from './styles/styles';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import camelcase from 'camelcase';
import { GetAvailableConstantsFunc, GetResultTypeFunc, ICodeEditorProps } from '../codeEditor/interfaces';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';
import { useConstantsEvaluator } from '../codeEditor/hooks/useConstantsEvaluator';
import { useResultTypeEvaluator } from '../codeEditor/hooks/useResultType';
import { Button } from 'antd';
import { CodeOutlined, CodeFilled } from '@ant-design/icons';
import { IPropertySetting, PropertySettingMode } from '@/providers/form/models';
import { CodeEditor } from '../codeEditor/codeEditor';
import { useDeepCompareMemo } from '@/hooks';

export type SettingsControlChildrenFunc<T = unknown> = (value: T, onChange: (val: T) => void, propertyName: string) => ReactElement;
export type SettingsControlChildrenType<T = unknown> = SettingsControlChildrenFunc<T> | ReactNode;

export interface ISettingsControlProps<Value = any> {
  propertyName: string;
  readOnly?: boolean;
  value?: IPropertySetting<Value>;
  setHasCode?: (hasCode: boolean) => void;
  hasCode?: boolean;
  mode: PropertySettingMode;
  onChange?: (value: IPropertySetting<Value>) => void;
  readonly children?: SettingsControlChildrenFunc<Value>;
  availableConstantsExpression?: string | GetAvailableConstantsFunc;
  resultTypeExpression?: string | GetResultTypeFunc;
  useAsyncEvaluation?: boolean;
  lazy?: boolean;
}

export const defaultExposedVariables: ICodeExposedVariable[] = [
  { name: "data", description: "Selected form values", type: "object" },
  { name: "pageContext", description: "Contexts data of current page", type: "object" },
  { name: "contexts", description: "Contexts data", type: "object" },
  { name: "globalState", description: "Global state", type: "object" },
  { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
  { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
  { name: "form", description: "Form instance", type: "object" },
  { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
  { name: "moment", description: "moment", type: "object" },
  { name: "http", description: "axiosHttp", type: "object" },
  { name: "message", description: "message framework", type: "object" },
  { name: "modal", description: "API for displaying modal dialogs and forms", type: "object" },
];

export const SettingsControl = <Value extends unknown = unknown>(props: ISettingsControlProps<Value>): ReactElement => {
  const { onChange } = props;

  const constantsEvaluator = useConstantsEvaluator({ availableConstantsExpression: props.availableConstantsExpression });
  const resultType = useResultTypeEvaluator({ resultTypeExpression: props.resultTypeExpression });

  const setting = getPropertySettingsFromValue(props.value);
  const { _mode: mode, _code: code } = setting;

  const { styles } = useStyles();

  const onInternalChange = useCallback((value: IPropertySetting<Value>, m?: PropertySettingMode): void => {
    const newSetting = { ...value, _mode: (m ?? mode) };
    const newValue = !!newSetting._code || newSetting._mode === 'code' ? newSetting : value._value;
    if (onChange)
      onChange(newValue);
  }, [mode, onChange]);

  const codeOnChange = (val: string): void => {
    const newValue: IPropertySetting<Value> = { ...setting, _code: val, _lazy: props.lazy ?? setting._lazy } as IPropertySetting<Value>;
    onInternalChange(newValue);
  };

  const valueOnChange = useDeepCompareMemo(() => {
    return (val: Value): void => {
      const newValue = { ...setting, _value: val };
      onInternalChange(newValue);
    };
  }, [setting]);

  const onSwitchMode = (): void => {
    const newMode = mode === 'code' ? 'value' : 'code';
    onInternalChange(setting, newMode);
  };


  const propertyName = !!setting._code || setting._mode === 'code' ? `${props.propertyName}._value` : props.propertyName;
  const functionName = `get${camelcase(props.propertyName, { pascalCase: true })}`;

  const codeEditorProps: ICodeEditorProps = {
    readOnly: props.readOnly,
    value: setting._code,
    onChange: codeOnChange,
    mode: 'dialog',
    language: 'typescript',
    propertyName: props.propertyName + 'Code',
    fileName: props.propertyName,
    wrapInTemplate: true,
    templateSettings: {
      functionName: functionName,
      useAsyncDeclaration: props.useAsyncEvaluation,
    },
    type: 'text',
    label: ' ',
    ghost: true,
    hidden: !setting._code && props.readOnly,
  };

  const editor = constantsEvaluator

    ? <CodeEditor {...codeEditorProps} availableConstants={constantsEvaluator} resultType={resultType} />
    : <CodeEditorWithStandardConstants {...codeEditorProps} resultType={resultType} />;

  return (
    <div className={mode === 'code' ? styles.contentCode : styles.contentJs}>
      <Button
        hidden={props.readOnly}
        className={`${styles.jsSwitch} inlineJS`}
        type="text"
        danger={mode === 'value' && !!code}
        size="small"
        icon={mode === 'code' && !!code ? <CodeFilled /> : !!code ? <CodeFilled /> : <CodeOutlined />}
        onClick={onSwitchMode}
      />
      {mode === 'code' && editor}
      {mode === 'value' && (
        <div className={styles.jsContent} style={{ marginLeft: 0 }}>
          {props.children(setting?._value, valueOnChange, propertyName)}
        </div>
      )}
    </div>
  );
};

export default SettingsControl;
