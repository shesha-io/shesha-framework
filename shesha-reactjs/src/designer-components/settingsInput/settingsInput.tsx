import { ComponentType, useMemo } from 'react';
import * as React from 'react';
import FormItem from "../_settings/components/formItem";
import { BaseInputProps, hasModelType, ISettingsInputProps, isSettingsInputProps } from './interfaces';
import { useSettingsComponents, FCUnwrapped, useShaFormInstance, ConditionalMetadataProvider, UnwrapCodeEvaluators } from '@/providers';
import { InputComponent } from '../inputComponent';
import { evaluateString } from '@/providers/form/utils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { isDefined } from '@/utils';

export type ISettingsComponent = IToolboxComponent & {
  component?: ComponentType<UnwrapCodeEvaluators<Omit<ISettingsInputProps, 'type' | 'propertyName' | 'label' | 'value'>>>;
};

export interface ISettingsComponentGroup {
  name: string;
  components: ISettingsComponent[];
}

export const SettingInput: FCUnwrapped<ISettingsInputProps> = (props) => {
  const { label, hideLabel, propertyName, type, readOnly, jsSetting, tooltip, hidden, visible, size, validate, validationDependencies, inline, width, hasExplicitWidth, availableConstantsExpression, permissionSettings, ...rest } = props;

  const { formData } = useShaFormInstance();
  const settingsComponents = useSettingsComponents();

  const customComponent = settingsComponents.find((c) => c.type === type);
  const CustomComponent = customComponent?.component;

  const evaluatedModelType = hasModelType(props) && isDefined(props.modelType)
    ? typeof props.modelType === 'string'
      ? evaluateString(props.modelType, { data: formData })
      : props.modelType
    : undefined;

  const isHidden = (typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden) === true || visible === false;

  const unwrappedType = isSettingsInputProps(props) ? props.inputType : props.type;

  const nestedProps = {
    ...props,
    type: unwrappedType,
    modelType: evaluatedModelType,
    size: size ?? 'small',
    width: undefined, // backward compatibility
  } as BaseInputProps;

  const style = useMemo(() => {
    if (unwrappedType === 'button' || unwrappedType === 'radio' || unwrappedType === 'iconPicker' || unwrappedType === 'colorPicker' || unwrappedType === 'multiColorPicker')
      return { width: 'auto' };

    // An explicitly declared width wins: lay the input out at exactly that width and don't let
    // it grow, otherwise a width-constrained field stretches to fill the row and the width stops
    // meaning anything. Everything else keeps the shared flex basis and shares the row as before.
    return hasExplicitWidth === true
      ? { flex: `0 0 ${typeof width === 'number' ? `${width}px` : width}`, width }
      : { flex: `${inline === true ? 0 : 1} 1 120px`, width };
  }, [unwrappedType, inline, width, hasExplicitWidth]);

  return isHidden ? null
    : (
      <div key={propertyName} style={style}>
        <ConditionalMetadataProvider modelType={evaluatedModelType}>
          <FormItem
            id={props.id ?? props.propertyName}
            name={propertyName}
            hideLabel={hideLabel}
            label={label}
            tooltip={tooltip}
            required={validate?.required}
            validationDependencies={validationDependencies}
            layout="vertical"
            jsSetting={unwrappedType === 'codeEditor' ? false : jsSetting}
            permissionSettings={unwrappedType === 'codeEditor' ? false : permissionSettings}
            readOnly={readOnly}
            availableConstantsExpression={availableConstantsExpression}
          >
            {CustomComponent
              ? <CustomComponent {...rest} />
              : (value, onChange): React.ReactElement => <InputComponent {...nestedProps} value={value} onChange={onChange} />}
          </FormItem>
        </ConditionalMetadataProvider>
      </div>
    )
  ;
};
