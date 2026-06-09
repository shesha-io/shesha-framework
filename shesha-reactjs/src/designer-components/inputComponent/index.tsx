import React, { FC, useCallback, useMemo, useRef } from 'react';
import { editorRegistry } from './wrappers';
import { BaseInputProps } from '../settingsInput/interfaces';
import { useFormItem, useShaFormInstance } from '@/providers';
import { Button, Divider, Popover } from 'antd';
import { RollbackOutlined, SyncOutlined } from '@ant-design/icons';
import { useDefaultModelActionsOrUndefined, useDefaultModelPropertyUpdateSubscription } from '../_settings/defaultModelProvider/defaultModelProvider';
import { getValueByPropertyName, setValueByPropertyName } from '@/utils/object';
import { convertValueToFriendlyString } from './utils';
import { useDeepCompareMemo } from '@/hooks';

// make value unknown to process any type of value (InputComponent is not generic)
export type InputComponentProps = Omit<BaseInputProps, 'value'> & {
  value: unknown;
  skipInheritance?: boolean;
};

export const InputComponent: FC<InputComponentProps> = (props) => {
  const { onChange, onChangeSetting, propertyName } = props;
  const Editor = editorRegistry[props.type] as FC<BaseInputProps>;
  const tempData = useRef<unknown>(null);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const { formData, setFormData } = useShaFormInstance();
  const defaultModel = useDefaultModelActionsOrUndefined();
  const { namePrefix } = useFormItem();

  useDefaultModelPropertyUpdateSubscription(propertyName);

  const defaultModelPropertyName = namePrefix ? namePrefix + '.' + propertyName : propertyName;

  // do not memoize because default model can be not initialized
  const defaultValue = defaultModel
    ? getValueByPropertyName(defaultModel.getDefaultModel() as Record<string, unknown>, defaultModelPropertyName)
    : undefined;

  const internalOnChange = useCallback((v: unknown): void => {
    tempData.current = onChangeSetting?.(v, formData, setFormData, tempData.current);
    onChange?.(v);
  }, [onChange, onChangeSetting, formData, setFormData]);

  const setOverride = useCallback((): void => {
    internalOnChange(defaultValue);
    const values = setValueByPropertyName({}, propertyName, defaultValue);
    setFormData({ values, mergeValues: true });
    setPopupOpen(false);
  }, [setFormData, propertyName, defaultValue, internalOnChange]);
  const resetToDefault = useCallback((): void => {
    internalOnChange(undefined);
    const values = setValueByPropertyName({}, propertyName, undefined);
    setFormData({ values, mergeValues: true });
    setPopupOpen(false);
  }, [internalOnChange, propertyName, setFormData]);

  const valueInfo = defaultModel?.getValueInfo(defaultModelPropertyName);
  const isInherited = valueInfo?.state === 'usedDefault';
  const isOverridden = valueInfo?.state === 'usedModel';
  const additionalInfo = defaultModel?.getCurrentValueAdditionalInfo(defaultModelPropertyName);

  // ToDo: AS - review memoize
  const content = useMemo(() => {
    const addInfo = typeof additionalInfo === 'function' ? (<div>{additionalInfo()}</div>) : null;
    const inheritanceInfo1 = isInherited ? `This value inherits from ${valueInfo.latestDefaultModelName}` : isOverridden ? `This value is overridden.` : null;
    const inheritanceInfo2 = isOverridden ? `Inherited value: ${convertValueToFriendlyString(defaultValue)}` : null;
    return props.tooltip || addInfo || inheritanceInfo1 || inheritanceInfo2 ? (
      <div style={{ width: '100%' }}>
        {Boolean(props.tooltip) && <div>{props.tooltip}</div>}
        {(Boolean(props.tooltip) && (Boolean(addInfo) || Boolean(inheritanceInfo1) || Boolean(inheritanceInfo2))) && <Divider size="small" />}
        {addInfo}
        {(Boolean(addInfo) && (Boolean(inheritanceInfo1) || Boolean(inheritanceInfo2))) && <Divider size="small" />}
        {inheritanceInfo1 && <div>{inheritanceInfo1}</div>}
        {inheritanceInfo2 && <div>{inheritanceInfo2}</div>}
        <div>{isInherited
          ? <Button type="link" onClick={() => setOverride()}><SyncOutlined /> Override inheritance</Button>
          : isOverridden && <Button type="link" onClick={() => resetToDefault()}><RollbackOutlined /> Reset to default</Button>}
        </div>
      </div>
    ) : null;
  }, [props.tooltip, additionalInfo, isInherited, valueInfo?.latestDefaultModelName, isOverridden, defaultValue, setOverride, resetToDefault]);

  const newProps = useDeepCompareMemo(() => ({ ...props, defaultModelPropertyName, onChange: internalOnChange } as BaseInputProps), [props, internalOnChange]);

  if (!Editor) return null;

  if (content && !props.skipInheritance) {
    return (
      <Popover content={content} trigger="hover" onOpenChange={setPopupOpen} open={popupOpen} autoAdjustOverflow={true} placement="topLeft">
        <div> {/* div is required to make Popover work for some input components */}
          <Editor key={newProps.id} {...newProps} />
        </div>
      </Popover>
    );
  }

  return (
    <Editor {...newProps} />
  );
};
