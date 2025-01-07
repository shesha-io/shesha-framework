import React from 'react';
import FormItem from "../_settings/components/formItem";
import { InputComponent } from '../inputComponent';
import { ISettingsInputProps } from './interfaces';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider } from '@/providers';

export const SettingInput: React.FC<ISettingsInputProps> = ({ children, label, hideLabel, propertyName: property, type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden, width,
    size, inline, validate, ...rest }) => {

    return hidden ? null :
        <div key={label} style={type === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
            <ConditionalWrap
                condition={Boolean(rest.modelType)}
                wrap={children => <MetadataProvider modelType={rest.modelType}>{children}</MetadataProvider>}
            >
                <FormItem
                    name={property}
                    hideLabel={hideLabel}
                    label={label}
                    tooltip={tooltip}
                    hidden={hidden}
                    required={validate?.required}
                    layout='vertical'
                    jsSetting={type === 'codeEditor' ? false : jsSetting ? jsSetting : false}
                    readOnly={readOnly}>
                    {children || <InputComponent size='small'
                        label={label}
                        type={type}
                        dropdownOptions={dropdownOptions}
                        buttonGroupOptions={buttonGroupOptions}
                        hasUnits={hasUnits} propertyName={property}
                        tooltip={tooltip}
                        readOnly={readOnly}
                        {...rest} />
                    }
                </FormItem>
            </ConditionalWrap>
        </div>
        ;

};