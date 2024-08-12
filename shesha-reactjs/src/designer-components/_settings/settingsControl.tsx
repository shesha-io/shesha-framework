import React, { FC, ReactElement, useState } from 'react';
import { getPropertySettingsFromValue } from './utils';
import { CodeEditor, IPropertySetting, PropertySettingMode } from '@/index';
import { Button } from 'antd';
import { useStyles } from './styles/styles';
import { isEqual } from 'lodash';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { useAvailableStandardConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import camelcase from 'camelcase';

export type SettingsControlChildrenType = (value: any, onChange: (val: any) => void, propertyName: string) => ReactElement;

export interface ISettingsControlProps {
  propertyName: string;
  readOnly?: boolean;
  value?: IPropertySetting;
  mode: PropertySettingMode;
  onChange?: (value: IPropertySetting) => void;
  readonly children?: SettingsControlChildrenType;
  exposedVariables?: ICodeExposedVariable[];
}

const defaultExposedVariables: ICodeExposedVariable[] = [
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

export const SettingsControl: FC<ISettingsControlProps> = (props) => {
  const { styles } = useStyles();
  const availableConstants = useAvailableStandardConstantsMetadata();

  const [internalState, setInternalState] = useState(() => {
    const initialSetting = getPropertySettingsFromValue(props.value);
    return {
      mode: initialSetting._mode || props.mode,
      codeValue: initialSetting._code || null,
      value: initialSetting._value
    };
  });

  const onInternalChange = (updates: Partial<typeof internalState>) => {
    const newState = { ...internalState, ...updates };
    setInternalState(newState);

    if (props.onChange) {
      const newSetting: IPropertySetting = {
        _mode: newState.mode,
        _code: newState.codeValue,
        _value: newState.value
      };
      props.onChange(newSetting);
    }
  };

  const codeOnChange = (val: string) => {
    onInternalChange({ codeValue: val });
  };

  const valueOnChange = (val: any) => {
    if (!isEqual(internalState.value, val)) {
      onInternalChange({ value: val });
    }
  };

  const onSwitchMode = () => {
    const newMode = internalState.mode === 'code' ? 'value' : 'code';
    onInternalChange({ mode: newMode });
  };

  const propertyName = internalState.mode === 'code' ? `${props.propertyName}._value` : props.propertyName;
  const functionName = `get${camelcase(props.propertyName, { pascalCase: true })}`;

  return (
    <div className={internalState.mode === 'code' ? styles.contentCode : styles.contentJs}>
      <Button
        hidden={props.readOnly}
        shape="round"
        className={styles.jsSwitch}
        type='primary'
        danger={internalState.mode === 'value' && !!internalState.codeValue}
        ghost
        size='small'
        onClick={onSwitchMode}
      >
        {internalState.mode === 'code' ? 'Value' : 'JS'}
      </Button>
      <div className={styles.jsContent}>
        {internalState.mode === 'code' &&
          <CodeEditor
            readOnly={props.readOnly}
            value={internalState.codeValue}
            onChange={codeOnChange}
            mode='dialog'
            language='typescript'
            propertyName={props.propertyName + 'Code'}
            fileName={props.propertyName}
            wrapInTemplate={true}
            templateSettings={{
              functionName: functionName
            }}
            availableConstants={availableConstants}
            exposedVariables={props.exposedVariables !== undefined ? props.exposedVariables : defaultExposedVariables}
          />
        }
        {internalState.mode === 'value' && props.children(internalState.value, valueOnChange, propertyName)}
      </div>
    </div>
  );
};

export default SettingsControl;
