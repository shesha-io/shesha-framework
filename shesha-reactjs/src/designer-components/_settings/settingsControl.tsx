import React, { ReactElement, ReactNode, useEffect } from 'react';
import { getPropertySettingsFromValue } from './utils';
import { CodeEditor, IPropertySetting, PropertySettingMode } from '@/index';
import { useStyles } from './styles/styles';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import camelcase from 'camelcase';
import { GetAvailableConstantsFunc, GetResultTypeFunc, ICodeEditorProps } from '../codeEditor/interfaces';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';
import { useConstantsEvaluator } from '../codeEditor/hooks/useConstantsEvaluator';
import { useResultTypeEvaluator } from '../codeEditor/hooks/useResultType';
import { Button } from 'antd';
import { CodeOutlined, CodeFilled } from '@ant-design/icons';

export type SettingsControlChildrenType = (value: any, onChange: (val: any) => void, propertyName: string) => ReactElement | ReactNode;

export interface ISettingsControlProps<Value = any> {
  propertyName: string;
  readOnly?: boolean;
  value?: IPropertySetting<Value>;
  setHasCode?: (hasCode: boolean) => void;
  hasCode?: boolean;
  mode: PropertySettingMode;
  onChange?: (value: IPropertySetting<Value>) => void;
  readonly children?: SettingsControlChildrenType;
  availableConstantsExpression?: string | GetAvailableConstantsFunc;
  resultTypeExpression?: string | GetResultTypeFunc;
  useAsyncEvaluation?: boolean;
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
];

export const SettingsControl = <Value = any>(props: ISettingsControlProps<Value>) => {

  const constantsEvaluator = useConstantsEvaluator({ availableConstantsExpression: props.availableConstantsExpression });
  const resultType = useResultTypeEvaluator({ resultTypeExpression: props.resultTypeExpression });

  const setting = getPropertySettingsFromValue(props.value);
  const { _mode: mode, _code: code } = setting;

  const { styles } = useStyles();

  const onInternalChange = (value: IPropertySetting, m?: PropertySettingMode) => {
    const newSetting = { ...value, _mode: (m ?? mode) };
    const newValue = !!newSetting._code || newSetting._mode === 'code' ? newSetting : value._value;
    if (props.onChange)
      props.onChange(newValue);
  };

  useEffect(() => {
    onInternalChange({ ...setting, _mode: mode }, mode);
  }, [mode]);

  const codeOnChange = (val: any) => {
    const newValue = { ...setting, _code: val };
    onInternalChange(newValue);
  };

  const valueOnChange = (val: any) => {
    const newValue = { ...setting, _value: val };
    onInternalChange(newValue);
  };

  const onSwitchMode = () => {
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
    exposedVariables: defaultExposedVariables,
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
        type='text'
        danger={mode === 'value' && !!code}
        size='small'
        icon={mode === 'code' && !!code ? <CodeFilled /> : !!code ? <CodeFilled /> : <CodeOutlined />}
        color='lightslategrey'
        onClick={onSwitchMode}
      />
      {mode === 'code' && editor}
      {mode === 'value' && <div className={styles.jsContent} style={{ marginLeft: 0 }}>
        {props.children(setting?._value, valueOnChange, propertyName)}
      </div>}
    </div>
  );
};

export default SettingsControl;