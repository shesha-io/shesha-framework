import React, { ComponentType } from 'react';
import FormItem from "../_settings/components/formItem";
import { BaseInputProps, hasModelType, ISettingsInputProps, isSettingsInputProps } from './interfaces';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider, useSettingsComponents } from '@/providers';
import { evaluateString, IToolboxComponentBase, useShaFormInstance } from '@/index';
import { InputComponent } from '../inputComponent';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export type ISettingsComponent = IToolboxComponentBase & {
  settingsComponent?: React.FC<any>;
  component?: ComponentType<any>;
};

export interface ISettingsComponentGroup {
  name: string;
  components: ISettingsComponent[];
}

export const SettingInput: React.FC<ISettingsInputProps> = (props) => {
  const { label, hideLabel, propertyName, type, readOnly, jsSetting, tooltip, hidden, size, validate, inline, width, ...rest } = props;

  const { formData } = useShaFormInstance();
  const settingsComponents = useSettingsComponents();

  const customComponent = settingsComponents.find((c) => c.type === type);
  const CustomComponent = customComponent?.component;

  const evaluatedModelType = hasModelType(props) && !isNullOrWhiteSpace(props.modelType) ? evaluateString(props.modelType, { data: formData }) : undefined;

  const isHidden = typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden;

  const unwrappedType = isSettingsInputProps(props) ? props.inputType : props.type;

  const nestedProps = {
    ...props,
    type: unwrappedType,
    modelType: evaluatedModelType,
    size: size ?? 'small',
  } as BaseInputProps;

  return isHidden ? null
    : (
      <div key={label} style={unwrappedType === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
        <ConditionalWrap
          condition={Boolean(evaluatedModelType)}
          wrap={(content) => <MetadataProvider modelType={evaluatedModelType}>{content}</MetadataProvider>}
        >
          <FormItem
            name={propertyName}
            hideLabel={hideLabel}
            label={label}
            tooltip={tooltip}
            required={validate?.required}
            layout="vertical"
            jsSetting={unwrappedType === 'codeEditor' ? false : jsSetting}
            readOnly={readOnly}
          >
            {CustomComponent ? <CustomComponent{...rest} /> : (
              <InputComponent
                {...nestedProps}
              />
            )}
          </FormItem>
        </ConditionalWrap>
      </div>
    )
  ;
};
