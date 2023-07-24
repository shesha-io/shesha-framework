import { nanoid } from 'nanoid';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const AnnotationSettingsForm = new DesignerToolbarSettings()
    .addSectionSeparator({
        id: "b8954bf6-f76d-4139-a850-c99bf06c8b69",
        propertyName: "separator1",
        parentId: "root",
        label: "Display"
    })
    .addPropertyAutocomplete({
        id: "5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4",
        propertyName: "name",
        parentId: "root",
        label: "Name",
        validate: {
            required: true
        }
    })
    .addTextField({
        id: "46d07439-4c18-468c-89e1-60c002ce96c5",
        propertyName: "label",
        parentId: "root",
        label: "Label"
    })
    .addDropdown({
        id: "57a40a33-7e08-4ce4-9f08-a34d24a83338",
        propertyName: "labelAlign",
        parentId: "root",
        label: "Label align",
        values: [
            {
                label: "left",
                value: "left",
                id: "f01e54aa-a1a4-4bd6-ba73-c395e48af8ce"
            },
            {
                label: "right",
                value: "right",
                id: "b920ef96-ae27-4a01-bfad-b5b7d07218da"
            }
        ],
        dataSourceType: "values"
    })
    .addTextArea({
        id: "2d32fe70-99a0-4825-ae6c-8b933004e119",
        propertyName: "description",
        parentId: "root",
        label: "Description"
    })
    .addDropdown({
        id: "df8a8f35-a50b-42f9-9642-73d390ceddbf",
        propertyName: "visibility",
        parentId: "root",
        label: "Visibility",
        description: "This property will eventually replace the 'hidden' property and other properties that toggle visibility on the UI and payload",
        allowClear: true,
        values: [
            {
                label: "Yes (Display in UI and include in payload)",
                value: "Yes",
                id: "53cd10ce-26af-474b-af75-8e7b1f19e51d"
            },
            {
                label: "No (Only include in payload)",
                value: "No",
                id: "f07a228c-cb9c-4da7-a8bc-bc2be518a058"
            },
            {
                label: "Removed (Remove from UI and exlude from payload)",
                value: "Removed",
                id: "3b6282ee-2eee-47ec-bab9-4cba52b970a0"
            }
        ],
        dataSourceType: "values"
    })
    .addCheckbox({
        id: "c6885251-96a6-40ce-99b2-4b5209a9e01c",
        propertyName: "hideLabel",
        parentId: "root",
        label: "Hide Label"
    })
    .addCheckbox({
        id: "24a8be15-98eb-40f7-99ea-ebb602693e9c",
        propertyName: "disabled",
        parentId: "root",
        label: "Disabled"
    })
    .addCodeEditor({
        id: "4b5e5951-4998-4635-b1c8-0b6d3940c300",
        propertyName: "customEnabled",
        label: "Custom Enabled",
        labelAlign: "right",
        parentId: "root",
        hidden: false,
        customEnabled: null,
        description: "Enter custom enabled code.  You must return true to enable the component. " + 
            "The global variable data is provided, and allows you to access the data of any form component, by using its API key.",
        validate: {},
        settingsValidationErrors: [],
        exposedVariables: [
            { id: "3be9da3f-f47e-48ae-b4c3-f5cc36e534d7", name: "value", description: "Component current value", type: "string | any" },
            { id: "3be9da3f-f58e-48ae-b4c3-f5cc36e534d7", name: "data", description: "Selected form values", type: "object" },
            { "propertyName": "formMode", "description": "The form mode", "type": "'readonly' | 'edit' | 'designer'" },
            { "propertyName": "globalState", "description": "The global state of the application", "type": "object" },
        ]
    })
    .addSectionSeparator({
        id: "5478b8f9-ec00-4d0a-9k2a-44a630cb2dcb",
        propertyName: "filesSeparator",
        parentId: "root",
        label: "Customize Annotation"
    })
    .addCheckbox({
        id: "3be9da3f-f47e-48ae-b4c3-f5cc36f934d9",
        propertyName: "isOnImage",
        parentId: "root",
        description: 'This property allows for annotation decriptions to be either on top of the image or on the side of the image.',
        label: "Annotation on Image"
    })
    .addCheckbox({
        id: "3be9da3f-f47k-71ae-b4c3-f5cc36f934d9",
        propertyName: "allowAddingNotes",
        parentId: "root",
        description: 'This property allows notes/comments to be added for each annotation or just have number as annotations.',
        defaultValue: true,
        label: "Allow adding notes"
    })
    .addNumberField({
        id: "417ee22e-a49d-44f2-a1c7-fef42ec89603",
        propertyName: "minPoints",
        parentId: "root",
        description: "This property denote least number of marks/points an image must have.",
        label: "Min number of points",
        min: 0,
    })
    .addNumberField({
        id: "417ee33e-a49d-44f2-a1c7-fef42ec87503",
        propertyName: "maxPoints",
        parentId: "root",
        description: "This property denote at most possible marks/points an image could have.",
        label: "Max number of points",
        min: 0,
    })
    .addSectionSeparator({
        id: "d675bfe4-ee69-431e-931b-b0e0b9ceee6f",
        propertyName: "separator2",
        parentId: "root",
        label: "Validation"
    })
    .addCheckbox({
        id: "3be9da3f-f47e-48ae-b4c3-f5cc36e534d9",
        propertyName: "validate.required",
        parentId: "root",
        label: "Required"
    })
    .addSectionSeparator({
        id: "6befdd49-41aa-41d6-a29e-76fa00590b75",
        propertyName: "sectionStyle",
        parentId: "root",
        label: "Style"
    })
    .addCodeEditor({
        id: "06ab0599-914d-4d2d-875c-765a495472f8",
        propertyName: "style",
        label: "Style",
        parentId: "root",
        validate: {},
        settingsValidationErrors: [],
        description: "A script that returns the style of the element as an object. This should conform to CSSProperties",
        exposedVariables: [
            { id: "3tg9da3f-f58e-48ae-b4c3-f5cc36e534d7", name: "data", description: "Form values", type: "object" },
            { id: nanoid(), name: "globalState", description: "The global state of the application", type: "object" }
        ]
    })

    .addSectionSeparator({
        id: "5478b8f9-ec00-4d0a-9d2a-44a630cb2dcb",
        propertyName: "filesSeparator",
        parentId: "root",
        label: "Files"
    })
    .addNumberField({
        id: "417ee22e-a49d-44f2-a1c7-fef42ec87503",
        propertyName: "height",
        parentId: "root",
        description: 'This property determines the height of the image in question.',
        label: "Height",
        validate: {
            required: true
        }
    })
    .addNumberField({
        id: "c6ecd70c-7419-4ea7-a715-d42699d26e6e",
        propertyName: "width",
        parentId: "root",
        description: 'This property determines the width of the image in question.',
        label: "Width",
        validate: {
            required: true
        }
    })
    .addCodeEditor({
        id: "06ab0599-914d-4d2d-875c-765a495482f8",
        propertyName: "url",
        label: "Url",
        parentId: "root",
        validate: {
            required: true
        },
        settingsValidationErrors: [],
        description: "A script that returns the image url as a string. This should return a string",
        exposedVariables: [
            { id: "fb85d916-39f9-4f88-8d87-c1c53558b078", name: "data", description: "Form values", type: "object" },
            { "propertyName": "globalState", "description": "The global state of the application", "type": "object" }]
    })
    .toJson();