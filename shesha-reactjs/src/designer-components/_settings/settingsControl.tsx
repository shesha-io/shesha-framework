import React, { ReactElement, useCallback } from 'react';
import { getPropertySettingsFromValue } from './utils/utils';
import { useStyles } from './styles/styles';
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
import { isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

export type SettingsControlChildrenFunc<T = unknown> = (value: T | undefined, onChange: (val: T) => void, propertyName?: string | undefined) => ReactElement;
export type SettingsControlChildrenType<T = unknown> = SettingsControlChildrenFunc<T> | ReactElement;

export interface ISettingsControlProps<Value = unknown> {
  enabled?: boolean;
  propertyName: string;
  readOnly?: boolean | undefined;
  value?: Value | IPropertySetting<Value> | null | undefined;
  setHasCode?: (hasCode: boolean) => void | undefined;
  hasCode?: boolean | undefined;
  mode: PropertySettingMode;
  onChange?: ((value: Value | IPropertySetting<Value> | undefined) => void) | undefined;
  readonly children?: SettingsControlChildrenFunc<Value> | undefined;
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
  resultTypeExpression?: string | GetResultTypeFunc | undefined;
  useAsyncEvaluation?: boolean | undefined;
  lazy?: boolean | undefined;
}

export const SettingsControl = <Value = unknown>(props: ISettingsControlProps<Value>): ReactElement => {
  const { onChange } = props;

  const constantsEvaluator = useConstantsEvaluator({ availableConstantsExpression: props.availableConstantsExpression, makeComponentsNullable: true });
  const resultType = useResultTypeEvaluator({ resultTypeExpression: props.resultTypeExpression });

  const setting = getPropertySettingsFromValue<Value>(props.value);
  // const { _mode: mode, _code: code } = setting;

  const { styles } = useStyles();

  const onInternalChange = useCallback((value: IPropertySetting<Value>, m?: PropertySettingMode | undefined): void => {
    const newSetting: IPropertySetting<Value> = { ...value, _mode: (m ?? setting._mode) };
    const newValue = isNotNullOrWhiteSpace(newSetting._code) || newSetting._mode === 'code'
      ? newSetting
      : newSetting._value;
    onChange?.(newValue);
  }, [onChange, setting._mode]);

  const codeOnChange = (val: string | null): void => {
    const newValue: IPropertySetting<Value> = { ...setting, _code: val, _lazy: props.lazy ?? setting._lazy } as IPropertySetting<Value>;
    onInternalChange(newValue);
  };

  const valueOnChange = useDeepCompareMemo(() => {
    return (val: Value): void => {
      const newValue = { ...setting, _value: val };
      onInternalChange(newValue);
    };
  }, [setting, onInternalChange]);

  const onSwitchMode = (): void => {
    const newMode = setting._mode === 'code' ? 'value' : 'code';
    onInternalChange(setting, newMode);
  };

  // Skip setting control if disabled
  if (props.enabled === false)
    return <>{props.children?.(setting._value, valueOnChange, props.propertyName)}</>;
  // --------------------------------

  const propertyName = isNotNullOrWhiteSpace(setting._code) || setting._mode === 'code' ? `${props.propertyName}._value` : props.propertyName;
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
    label: ' ',
    hidden: isNullOrWhiteSpace(setting._code) && props.readOnly,
  };

  const editor = constantsEvaluator
    ? <CodeEditor {...codeEditorProps} availableConstants={constantsEvaluator} resultType={resultType} />
    : <CodeEditorWithStandardConstants {...codeEditorProps} resultType={resultType} makeComponentsNullable={true} />;

  return (
    <div className={setting._mode === 'code' ? styles.contentCode : styles.contentJs}>
      <Button
        hidden={props.readOnly}
        className={`${styles.jsSwitch} inlineJS`}
        type="text"
        danger={setting._mode === 'value' && isNotNullOrWhiteSpace(setting._code)}
        size="small"
        icon={isNotNullOrWhiteSpace(setting._code) ? <CodeFilled /> : <CodeOutlined />}
        onClick={onSwitchMode}
      />
      {setting._mode === 'code' && editor}
      {setting._mode === 'value' && (
        <div className={styles.jsContent} style={{ marginLeft: 0 }}>
          {props.children?.(setting._value, valueOnChange, propertyName)}
        </div>
      )}
    </div>
  );
};

export default SettingsControl;
