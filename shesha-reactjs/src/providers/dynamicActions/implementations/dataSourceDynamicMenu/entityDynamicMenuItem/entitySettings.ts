import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = () => {
    const parentId = nanoid();
    return {
        components: new DesignerToolbarSettings()
            .addSettingsInputRow({
                id: parentId,
                inputs: [
                    {
                        id: nanoid(),
                        type: 'autocomplete',
                        propertyName: 'entityTypeShortAlias',
                        label: 'Entity Type',
                        labelAlign: 'right',
                        hidden: false,
                        dataSourceType: 'url',
                        validate: {},
                        dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                        useRawValues: true
                    },
                    {
                        id: nanoid(),
                        type: 'numberField',
                        propertyName: 'maxResultCount',
                        label: 'Max Result Count',
                        labelAlign: 'right',
                        hidden: false,
                        validate: {},
                        settingsValidationErrors: []
                    }
                ]
            })
            .addContainer({
                id: nanoid(),
                parentId: parentId,
                hidden: {
                    _code: 'return !getSettingValue(data?.entityTypeShortAlias);',
                    _mode: 'code',
                    _value: false
                },
                components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                        id: nanoid(),
                        inputs: [{
                            id: nanoid(),
                            type: 'queryBuilder',
                            propertyName: 'filter',
                            label: 'Entity Filter',
                            labelAlign: 'right',
                            parentId: parentId,
                            isDynamic: false,
                            validate: {},
                            settingsValidationErrors: [],
                            modelType: {
                                _code: 'return getSettingValue(data?.entityTypeShortAlias);',
                                _mode: 'code',
                                _value: false
                            } as any,
                            hidden: {
                                _code: 'return !getSettingValue(data?.entityTypeShortAlias);',
                                _mode: 'code',
                                _value: false
                            } as any,
                            fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                        }]
                    })

                    .addSettingsInputRow({
                        id: nanoid(),
                        inputs: [
                            {
                                id: nanoid(),
                                type: 'propertyAutocomplete',
                                propertyName: 'labelProperty',
                                label: 'Label Property',
                                labelAlign: 'right',
                                parentId: parentId,

                                isDynamic: false,
                                placeholder: '',
                                description: 'Name of the property that should be used for the label of the button.',
                                validate: {
                                    required: true
                                },
                                modelType: {
                                    _code: 'return getSettingValue(data?.entityTypeShortAlias);',
                                    _mode: 'code',
                                    _value: false
                                } as any,
                                autoFillProps: false,
                            },
                            {
                                id: nanoid(),
                                type: 'propertyAutocomplete',
                                propertyName: 'tooltipProperty',
                                label: 'Tooltip Property',
                                labelAlign: 'right',
                                parentId: parentId,
                                isDynamic: false,
                                placeholder: '',
                                description: 'Name of the property that should be used for the tooltip of the button.',
                                validate: {},
                                modelType: {
                                    _code: 'return getSettingValue(data?.entityTypeShortAlias);',
                                    _mode: 'code',
                                    _value: false
                                } as any,
                                autoFillProps: false
                            }]
                    })
                    .toJson()
                ]
            })
            .addSettingsInputRow({
                id: nanoid(),
                parentId: parentId,
                inputs: [
                    {
                        id: nanoid(),
                        type: 'dropdown',
                        propertyName: 'buttonType',
                        label: 'Button Type',
                        labelAlign: 'right',
                        hidden: false,
                        validate: {
                            required: true
                        },
                        dropdownOptions: buttonTypes,
                        jsSetting: false
                    },
                    {
                        id: nanoid(),
                        type: 'configurableActionConfigurator',
                        propertyName: 'actionConfiguration',
                        label: 'Action Configuration',
                        hidden: false,
                        hideLabel: true,
                        validate: {},
                        jsSetting: false,
                        settingsValidationErrors: [],
                    }
                ]
            })
            .toJson(),
        formSettings: {
            layout: 'vertical',
            colon: true,
            labelCol: {
                span: 24
            },
            wrapperCol: {
                span: 24
            },
        }
    };
}; 