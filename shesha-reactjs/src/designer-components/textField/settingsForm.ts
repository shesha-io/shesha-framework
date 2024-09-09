import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const settingFormMarkup = (data: { readOnly?: boolean }) =>
    new DesignerToolbarSettings(data)
        .addSearchableTabs({
            id: nanoid(),
            propertyName: 'settingsTabs',
            parentId: 'root',
            label: 'Settings',
            tabs: [
                {
                    id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                    key: 'display',
                    title: 'Display',
                    components: [
                        ...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: nanoid(),
                                propertyName: 'propertyName',
                                label: 'Property name',
                                validate: { required: true },
                            })
                            .addTextField({
                                id: nanoid(),
                                propertyName: 'label',
                                label: 'Label',
                                jsSetting: true,
                            })
                            .addDropdown({
                                id: nanoid(),
                                propertyName: 'textType',
                                label: 'Type',
                                dataSourceType: 'values',
                                values: [
                                    { id: nanoid(), label: 'text', value: 'text' },
                                    { id: nanoid(), label: 'password', value: 'password' },
                                    { id: nanoid(), label: 'email', value: 'email' },
                                    { id: nanoid(), label: 'number', value: 'number' },
                                ],
                            })
                            .addTextField({
                                id: nanoid(),
                                propertyName: 'placeholder',
                                label: 'Placeholder',
                            })
                            .addTextArea({
                                id: nanoid(),
                                propertyName: 'description',
                                label: 'Description',
                            })
                            .addCheckbox({
                                id: nanoid(),
                                propertyName: 'passEmptyStringByDefault',
                                label: 'Empty as default',
                                description: 'Whether the component should be initialized with an empty string',
                            })
                            .addTextField({
                                id: nanoid(),
                                propertyName: 'initialValue',
                                label: 'Default Value',
                                description: 'Enter default value of component. (formData, formMode, globalState) are exposed',
                            })
                            .addSwitch({
                                id: nanoid(),
                                propertyName: 'hidden',
                                label: 'Hidden',
                            })
                            .addEditMode({
                                id: nanoid(),
                                propertyName: 'editMode',
                                label: 'Edit mode',
                            })
                            .toJson(),
                    ],
                },
                {
                    id: '34f44t34ffsef3445553f5tefv5',
                    key: 'events',
                    title: 'Events',
                    components: [
                        ...new DesignerToolbarSettings()
                            .addCodeEditor({
                                id: nanoid(),
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                description: 'Enter custom eventhandler on changing of event. (form, event) are exposed',
                            })
                            .addCodeEditor({
                                id: nanoid(),
                                propertyName: 'onFocusCustom',
                                label: 'On Focus',
                                description: 'Enter custom eventhandler on focus of event. (form, event) are exposed',
                            })
                            .addCodeEditor({
                                id: nanoid(),
                                propertyName: 'onBlurCustom',
                                label: 'On Blur',
                                description: 'Enter custom eventhandler on blur of event. (form, event) are exposed',
                            })
                            .toJson(),
                    ],
                },
                {
                    id: '34f44t34ffsef3A45M53f5tefv5',
                    key: 'validation',
                    title: 'Validation',
                    components: [
                        ...new DesignerToolbarSettings()
                            .addCheckbox({
                                id: nanoid(),
                                propertyName: 'validate.required',
                                label: 'Required',
                            })
                            .addNumberField({
                                id: nanoid(),
                                propertyName: 'validate.minLength',
                                label: 'Min Length',
                            })
                            .addNumberField({
                                id: nanoid(),
                                propertyName: 'validate.maxLength',
                                label: 'Max Length',
                            })
                            .addTextField({
                                id: nanoid(),
                                propertyName: 'validate.message',
                                label: 'Message',
                            })
                            .addCodeEditor({
                                id: nanoid(),
                                propertyName: 'validate.validator',
                                label: 'Validator',
                                description: 'Enter custom validator logic for form.item rules. Returns a Promise',
                            })
                            .toJson(),
                    ],
                },
                {
                    id: '34f44t34ffsef3A45M53f5tesA',
                    key: 'style',
                    title: 'Style',
                    components: [
                        ...new DesignerToolbarSettings()
                            .addFontStyle({
                                id: nanoid(),
                                propertyName: 'font',
                            })
                            .addSizeStyle({
                                id: nanoid(),
                                propertyName: 'dimensions',
                            })
                            .addBorderStyle({
                                id: nanoid(),
                                propertyName: 'border',
                            })
                            .addBackgroundStyle({
                                id: nanoid(),
                                propertyName: 'background',
                            })
                            .addStyleBox({
                                id: nanoid(),
                                propertyName: 'stylingBox',
                            })
                            .toJson(),
                    ],
                },
                {
                    id: '34fjjfd34ffsef3A45M53f5tesA',
                    key: 'security',
                    title: 'Security',
                    components: [
                        ...new DesignerToolbarSettings()
                            .addPermissionAutocomplete({
                                id: nanoid(),
                                propertyName: 'permissions',
                                label: 'Permissions',
                            })
                            .toJson(),
                    ],
                },
            ],
        })
        .toJson();