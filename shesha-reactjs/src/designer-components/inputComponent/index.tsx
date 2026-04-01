import React, { FC, useMemo, useRef } from 'react';
import { editorRegistry } from './wrappers';
import { BaseInputProps } from '../settingsInput/interfaces';
import { useFormItem, useShaFormInstance } from '@/providers';
import { Button, Divider, Popover } from 'antd';
import { RollbackOutlined, SyncOutlined } from '@ant-design/icons';
import { useDefaultModelProviderStateOrUndefined } from '../_settings/defaultModelProvider/defaultModelProvider';
import { getValueByPropertyName } from '@/utils/object';
import { convertValueToFriendlyString } from './utils';

export const InputComponent: FC<BaseInputProps> = (props) => {
  const Editor = editorRegistry[props.type] as FC<BaseInputProps>;
  const tempData = useRef<unknown>(null);
  const { formData, setFormData } = useShaFormInstance();

  const { onChange, onChangeSetting } = props;

  const { namePrefix } = useFormItem();
  const defaultModelPropName = namePrefix ? namePrefix + '.' + props.propertyName : props.propertyName;

  const defaultModel = useDefaultModelProviderStateOrUndefined();
  // do not memoize because default model can be not initialized
  const defaultValue = defaultModel
    ? getValueByPropertyName(defaultModel.getDefaultModel() as Record<string, unknown>, defaultModelPropName)
    : undefined;

  const internalOnChange = (v: unknown): void => {
    tempData.current = onChangeSetting?.(v, formData, setFormData, tempData.current);
    onChange?.(v);
  };
  const newProps = { ...props, onChange: internalOnChange };

  const setOverride = (): void => internalOnChange(defaultValue);
  const resetToDefault = (): void => internalOnChange(undefined);

  const valueInfo = defaultModel?.getValueInfo(defaultModelPropName);
  const isInherited = valueInfo.state === 'usedDefault';
  const isOverrided = valueInfo.state === 'usedModel';
  const additionalInfo = defaultModel?.getCurrentValueAdditionalInfo(defaultModelPropName);

  const content = useMemo(() => (
    <div style={{ width: '100%' }}>
      {Boolean(props.tooltip) && (
        <div><div>{props.tooltip}</div><Divider size="small" /></div>
      )}
      {typeof additionalInfo === 'function' && (
        <div><div>{additionalInfo()}</div><Divider size="small" /></div>
      )}
      <div>{isInherited ? `This value inherits from ${valueInfo.latestDefaultModelName}` : `This value is overrided.`}</div>
      {isOverrided && <div>Inherited value: {convertValueToFriendlyString(defaultValue)}</div>}
      <div>{isInherited
        ? <Button type="link" onClick={() => setOverride()}><SyncOutlined /> Override inheritance</Button>
        : <Button type="link" onClick={() => resetToDefault()}><RollbackOutlined /> Reset to default</Button>}
      </div>
    </div>
  ), [props.tooltip, additionalInfo, isInherited, valueInfo.latestDefaultModelName, isOverrided, defaultValue, setOverride, resetToDefault]);

  if (!Editor) return undefined;

  if (isInherited || isOverrided) {
    return (
      <Popover content={content} trigger="hover" autoAdjustOverflow={true} placement="topLeft">
        <span></span>
        <Editor {...newProps} />
      </Popover>
    );
  }

  return (
    <Editor {...newProps} />
  );
};
