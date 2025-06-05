import React from 'react';
import FormItem from "../_settings/components/formItem";
import { InputComponent } from '../inputComponent';
import { ISettingsInputProps } from './interfaces';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider } from '@/providers';
import { evaluateString, useShaFormInstance } from '@/index';

export const SettingInput: React.FC<ISettingsInputProps> = ({ children, label, hideLabel, propertyName: property, type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden, width,
    size, inline, validate, modelType, ...rest }) => {
    const { formData } = useShaFormInstance();

    const evaluatedModelType = typeof modelType === 'string' ? evaluateString(modelType, { data: formData }) : modelType;
    const isHidden = typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden;

    return isHidden ? null :
        <div key={label} style={type === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
            <ConditionalWrap
                condition={Boolean(modelType)}
                wrap={content => <MetadataProvider modelType={evaluatedModelType}>{content}</MetadataProvider>}
            >
                <FormItem
                    name={property}
                    hideLabel={hideLabel}
                    label={label}
                    tooltip={tooltip}
                    required={validate?.required}
                    layout='vertical'
                    jsSetting={type === 'codeEditor' || rest.inputType === 'codeEditor' ? false : jsSetting}
                    readOnly={readOnly}>
                    {children || <InputComponent size={size ?? 'small'}
                        label={label}
                        type={rest.inputType || type}
                        dropdownOptions={dropdownOptions}
                        buttonGroupOptions={buttonGroupOptions}
                        hasUnits={hasUnits} propertyName={property}
                        tooltip={tooltip}
                        readOnly={readOnly}
                        modelType={evaluatedModelType}
                        {...rest} />
                    }
                </FormItem>
            </ConditionalWrap>
        </div>
        ;

};