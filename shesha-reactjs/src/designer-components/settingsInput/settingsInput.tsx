import React from 'react';
import FormItem from "../_settings/components/formItem";
import { InputComponent } from '../inputComponent';
import { ISettingsInputProps } from './interfaces';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider, useFormData } from '@/providers';
import { evaluateString } from '@/index';

export const SettingInput: React.FC<ISettingsInputProps> = ({ children, label, hideLabel, propertyName: property, type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden, width,
    size, inline, validate, modelType: modelTypeExpression, ...rest }) => {
    const { data: formData } = useFormData();

    const modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;
    const isHidden = typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden;

    return isHidden ? null :
        <div key={label} style={type === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
            <ConditionalWrap
                condition={Boolean(modelType)}
                wrap={content => <MetadataProvider modelType={modelType}>{content}</MetadataProvider>}
            >
                <FormItem
                    name={property}
                    hideLabel={hideLabel}
                    label={label}
                    tooltip={tooltip}
                    hidden={isHidden as any}
                    required={validate?.required}
                    layout='vertical'
                    jsSetting={type === 'codeEditor' ? false : jsSetting ? jsSetting : false}
                    readOnly={readOnly}>
                    {children || <InputComponent size={size ?? 'small'}
                        label={label}
                        type={type}
                        dropdownOptions={dropdownOptions}
                        buttonGroupOptions={buttonGroupOptions}
                        hasUnits={hasUnits} propertyName={property}
                        tooltip={tooltip}
                        readOnly={readOnly}
                        modelType={modelType}
                        hidden={isHidden}
                        {...rest} />
                    }
                </FormItem>
            </ConditionalWrap>
        </div>
        ;

};