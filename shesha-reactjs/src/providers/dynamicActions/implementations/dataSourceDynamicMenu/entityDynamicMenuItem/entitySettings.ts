import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = () => {
    const containerId = nanoid();
    return {
        components: new DesignerToolbarSettings()
            .addSettingsInputRow({
                id: nanoid(),
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
                id: containerId,
                hidden: {
                    _code: 'return !getSettingValue(data?.entityTypeShortAlias);',
                    _mode: 'code',
                    _value: false
                } as any,
                components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                        id: nanoid(),
                        parentId: containerId,
                        inputs: [{
                            id: nanoid(),
                            type: 'queryBuilder',
                            propertyName: 'filter',
                            label: 'Entity Filter',
                            labelAlign: 'right',
                            isDynamic: false,
                            validate: {},
                            settingsValidationErrors: [],
                            modelType: {
                                _code: 'return getSettingValue(data?.entityTypeShortAlias);',
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
                inputs: [
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