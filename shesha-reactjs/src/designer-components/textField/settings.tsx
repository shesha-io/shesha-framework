import React, { FC } from 'react';
import { ITextFieldComponentProps } from './interfaces';
import { SettingInput } from '../settingsInput/settingsInput';
import SearchableTabsComponent from '../propertiesTabs/searchableTabsComponent';
import { ISettingsFormFactoryArgs } from '@/interfaces';

const TextFieldSettings: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) => {
    const readOnly = props.readOnly || false;

    const tabs = [
        {
            key: '1',
            label: 'Common',
            children: (
                <>
                    <SettingInput
                        label="Property Name"
                        propertyName='propertyName'
                        inputType='contextPropertyAutocomplete'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Label"
                        propertyName='hideLabel'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Placeholder"
                        propertyName='placeholder'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Tooltip"
                        propertyName='description'
                        readOnly={readOnly}
                        inputType='textArea'
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Readonly"
                        propertyName='editMode'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Hide"
                        propertyName='hidden'
                        readOnly={readOnly}
                        inputType='switch'
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Type"
                        propertyName='textType'
                        readOnly={readOnly}
                        inputType='dropdown'
                        jsSetting={true}
                        dropdownOptions={[
                            { label: 'text', value: 'text' },
                            { label: 'password', value: 'password' }
                        ]}
                    />
                    <SettingInput
                        label="Default Value"
                        propertyName='initialValue'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Prefix"
                        propertyName='prefix'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Prefix Icon"
                        propertyName='prefixIcon'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Suffix"
                        propertyName='suffix'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Suffix Icon"
                        propertyName='suffixIcon'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                </>
            )
        },
        {
            key: '2',
            label: 'Validation',
            children: (
                <>
                    <SettingInput
                        label="Required"
                        propertyName='validate.required'
                        readOnly={readOnly}
                        inputType='switch'
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Min Length"
                        propertyName='validate.minLength'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Max Length"
                        propertyName='validate.maxLength'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Message"
                        propertyName='validate.message'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Validator"
                        propertyName='validate.validator'
                        readOnly={readOnly}
                        inputType='codeEditor'
                        jsSetting={true}
                    />
                </>
            )
        },
        {
            key: '3',
            label: 'Events',
            children: (
                <>
                    <SettingInput
                        label="On Change"
                        propertyName='onChangeCustom'
                        readOnly={readOnly}
                        inputType='codeEditor'
                    />
                    <SettingInput
                        label="On Focus"
                        propertyName='onFocusCustom'
                        readOnly={readOnly}
                        inputType='codeEditor'
                    />
                    <SettingInput
                        label="On Blur"
                        propertyName='onBlurCustom'
                        readOnly={readOnly}
                        inputType='codeEditor'
                    />
                </>
            )
        },
        {
            key: '4',
            label: 'Appearance',
            children: (
                <>
                    <SettingInput
                        label="Font Size"
                        propertyName='inputStyles.font.size'
                        readOnly={readOnly}
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Font Weight"
                        propertyName='inputStyles.font.weight'
                        readOnly={readOnly}
                        inputType='dropdown'
                        jsSetting={true}
                        dropdownOptions={[
                            { value: '100', label: 'Light' },
                            { value: '400', label: 'Normal' },
                            { value: '700', label: 'Bold' }
                        ]}
                    />
                    <SettingInput
                        label="Font Color"
                        propertyName='inputStyles.font.color'
                        readOnly={readOnly}
                        inputType='color'
                        jsSetting={true}
                    />
                    <SettingInput
                        label="Font Family"
                        propertyName='inputStyles.font.type'
                        readOnly={readOnly}
                        inputType='dropdown'
                        jsSetting={true}
                        dropdownOptions={[
                            { value: 'Arial', label: 'Arial' },
                            { value: 'Helvetica', label: 'Helvetica' },
                            { value: 'Times New Roman', label: 'Times New Roman' }
                        ]}
                    />
                    <SettingInput
                        label="Text Align"
                        propertyName='inputStyles.font.align'
                        readOnly={readOnly}
                        inputType='dropdown'
                        jsSetting={true}
                        dropdownOptions={[
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' },
                            { value: 'right', label: 'Right' }
                        ]}
                    />
                </>
            )
        },
        {
            key: '5',
            label: 'Security',
            children: (
                <SettingInput
                    label="Permissions"
                    propertyName='permissions'
                    readOnly={readOnly}
                    inputType='permissions'
                    jsSetting={true}
                />
            )
        }
    ];

    return (
        <SearchableTabsComponent
            value={props}
            model={{
                tabs: tabs,
                tabType: "card",
                defaultActiveKey: "1",
                hideWhenEmpty: true
            }}
        />
    );
};

export const TextFieldSettingsForm: FC<ISettingsFormFactoryArgs<ITextFieldComponentProps>> = (props) =>
    <TextFieldSettings {...props} />;