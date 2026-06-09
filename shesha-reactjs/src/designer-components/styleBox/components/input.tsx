import React, { FC } from 'react';
import { IInputDirection, IValue } from '../interfaces';
import { getStyleClassName } from '../styles/styles';
import camelcase from 'camelcase';
import { StyleBoxValue } from '../../../providers/form/models';
import { InputComponent } from '@/designer-components/inputComponent';
import { useDefaultModelPropertyUpdateSubscription, useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { useStyles } from '@/designer-components/_settings/styles/styles';
import { getValueByPropertyName } from '@/utils/object';
import { useFormItem } from '@/providers';

interface IProps {
  direction: keyof IInputDirection;
  onChange?: Function;
  readOnly?: boolean;
  type: keyof IValue;
  value?: StyleBoxValue;
  propertyName?: string;
}

const BoxInput: FC<IProps> = ({ direction, onChange, readOnly, type, value, propertyName: parentPropertyName }) => {
  const { styles } = useStyles();

  const { namePrefix } = useFormItem();
  const propertyName = camelcase(`${type}_${direction}`);
  const fullName = `${parentPropertyName}.${propertyName}`;
  const defaultName = namePrefix ? namePrefix + '.' + fullName : fullName;

  useDefaultModelPropertyUpdateSubscription(defaultName);

  const defaultModel = useDefaultModelActionsOrUndefined();
  const valueInfo = defaultModel?.getValueInfo(defaultName);
  const defaultValue = getValueByPropertyName(defaultModel?.getDefaultModel() as Record<string, unknown>, defaultName);
  const className = valueInfo?.state === 'usedDefault' ? styles.inheritedValue : valueInfo?.state === 'usedModel' ? styles.overriddenValue : '';

  const localValue = defaultModel?.getValueInfo(defaultName)?.state === 'usedDefault' ? defaultValue : value?.[propertyName];

  const internalOnChange = (val: string): void => {
    if ((!val || val.length < 4) && onChange)
      onChange({ [propertyName]: val });
  };

  return (
    <div className={className}>
      <div className={getStyleClassName(type, direction)}>
        <InputComponent
          type="textField"
          size="small"
          value={localValue}
          onChange={internalOnChange}
          label=""
          propertyName={fullName}
          readOnly={readOnly}
          width="30px"
        />
      </div>
    </div>
  );
};

export default BoxInput;
