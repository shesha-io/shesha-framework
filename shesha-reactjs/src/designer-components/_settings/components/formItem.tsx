import React, { cloneElement, FC, ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import SettingsControl from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';
import { useStyles } from '../styles/styles';
import { useDefaultModelProviderStateOrUndefined } from '../defaultModelProvider/defaultModelProvider';
import { getValueByPropertyName } from '@/utils/object';
import { IComponentModelProps, useFormItem } from '@/providers';
import { isEqual } from 'lodash';

const FormItem: FC<ISettingsFormItemProps> = (props) => {
  const { styles } = useStyles();
  const { name, label, tooltip, required, hidden, jsSetting, children, valuePropName = 'value', layout, availableConstantsExpression } = props;
  const [hasCode, setHasCode] = useState(false);

  const { namePrefix } = useFormItem();
  const defaultModelPropName = namePrefix ? namePrefix + '.' + name : name;

  const defaultModel = useDefaultModelProviderStateOrUndefined();
  const valueInfo = defaultModel?.getValueInfo(defaultModelPropName);
  const defaultValue = getValueByPropertyName(defaultModel?.getDefaultModel() as Record<string, unknown>, defaultModelPropName);
  const className = valueInfo?.state === 'usedDefault' ? styles.inheritedValue : valueInfo?.state === 'usedModel' ? styles.overriddenValue : '';

  const clonedComponent = useRef<ReactElement>(undefined);
  const storedState = useRef<{ value: unknown; readOnly: boolean }>(undefined);

  const childElement = children as ReactElement;
  const readOnly = props.readOnly || childElement.props.readOnly || childElement.props.disabled;

  const handleChange = useCallback((onChange) => (...args: any[]) => {
    const event = args[0];
    const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
      ? (event.target as HTMLInputElement)[valuePropName]
      : event;
    onChange(data);
  }, [valuePropName]);

  const createClonedElement = useCallback((value, onChange): ReactElement => cloneElement(
    childElement,
    {
      ...childElement?.props,
      readOnly: readOnly,
      size: 'small',
      disabled: readOnly,
      onChange: handleChange(onChange),
      [valuePropName]: value,
      key: props.id,
    },
  ), [childElement, handleChange, props.id, readOnly, valuePropName]);

  const formItemModel: IComponentModelProps = useMemo(() => ({
    hideLabel: props.hideLabel,
    propertyName: name,
    label: <div className={styles.label}>{label}</div>,
    type: props.type,
    id: props.id,
    description: tooltip,
    validate: { required },
    hidden,
    layout,
    size: 'small',
  }), [hidden, label, layout, name, props.hideLabel, props.id, props.type, required, styles.label, tooltip]);

  const localChildren = useCallback((value, onChange) => {
    const localValue = valueInfo?.state === 'usedDefault' ? defaultValue : value;
    const newState = { readOnly, value: localValue };
    if (!isEqual(storedState.current, newState)) {
      storedState.current = { ...newState };
      clonedComponent.current = jsSetting
        ? (
          <SettingsControl
            key={props.id}
            propertyName={name}
            mode="value"
            onChange={onChange}
            value={localValue}
            setHasCode={setHasCode}
            hasCode={hasCode}
            readOnly={readOnly}
            lazy={jsSetting === 'lazy'}
            availableConstantsExpression={availableConstantsExpression}
          >
            {(val, onChange) => {
              return createClonedElement(val, onChange);
            }}
          </SettingsControl>
        )
        : createClonedElement(localValue, onChange);
    }
    return clonedComponent.current;
  }, [availableConstantsExpression, createClonedElement, defaultValue, hasCode, jsSetting, name, props.id, readOnly, valueInfo?.state]);

  return (
    <ConfigurableFormItem
      model={formItemModel}
      className={`sha-js-label ${className}`}
    >
      {localChildren}
    </ConfigurableFormItem>
  );
};

export default FormItem;
