import { nanoid } from 'nanoid';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const RefListStatusSettingsForm = new DesignerToolbarSettings()
    .addSectionSeparator({
        id: "b8954bf6-f76d-4139-a850-c99bf06c8b69",
        name: "separator1",
        parentId: "root",
        label: "Display"
    })
    .addPropertyAutocomplete({
        id: "5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4",
        name: "name",
        parentId: "root",
        label: "Name",
        validate: {
            required: true
        }
    })
    .addTextField({
        id: "46d07439-4c18-468c-89e1-60c002ce96c5",
        name: "label",
        parentId: "root",
        label: "Label"
    })
    .addDropdown({
        id: "57a40a33-7e08-4ce4-9f08-a34d24a83338",
        name: "labelAlign",
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
        name: "description",
        parentId: "root",
        label: "Description",
        readOnly: false
    })
    .addCheckbox({
        id: "cfd7d45e-c7e3-4a27-987b-dc525c412448",
        name: "hidden",
        parentId: "root",
        label: "Hidden"
    })
    .addCheckbox({
        id: "c6885251-96a6-40ce-99b2-4v5209a9e01c",
        name: "hideLabel",
        parentId: "root",
        defaultValue: true,
        label: "Hide Label"
    })
    .addSectionSeparator({
        id: "5478b8f9-ec00-4d0a-9k2a-44a630cb2dcb",
        name: "filesSeparator",
        parentId: "root",
        label: "Customize Status"
    })
    .addCheckbox({
        id: "3fg9da3f-f47e-48ae-b4c3-f5cc36f934d9",
        name: "showReflistName",
        parentId: "root",
        defaultValue: true,
        label: "Show Reflist Item Name"
    })
    .addCheckbox({
        id: "3be9da3f-f47e-48ae-b4c3-f5cc36f934d9",
        name: "showIcon",
        parentId: "root",
        label: "Show Icon"
    })
    .addCheckbox({
        id: "3be9da3f-f47e-49ae-b8c3-f5cc36f164d9",
        name: "solidBackground",
        parentId: "root",
        defaultValue: true,
        label: "Show Solid Background"
    })
    .addSectionSeparator({
        id: "6befdd49-41aa-41d6-a29e-76fa00590b75",
        name: "sectionStyle",
        parentId: "root",
        label: "Style"
    })
    .addCodeEditor({
        id: "06ab0599-914d-4d2d-875c-765a495472f8",
        name: "style",
        label: "Style",
        parentId: "root",
        validate: {},
        settingsValidationErrors: [],
        description: "A script that returns the style of the element as an object. This should conform to CSSProperties",
        exposedVariables: [{ id: "3tg9da3f-f58e-48ae-b4c3-f5cc36e534d7", name: "data", description: "Form values", type: "object" }]
    })

    .addSectionSeparator({
        id: "5478b8f9-ec00-4d0a-9d2a-44a630cb2dcb",
        name: "filesSeparator",
        parentId: "root",
        label: "RefList Source"
    })
    .addTextField({
        id: "417ee22e-a49d-44f2-a1c7-fef42ec87503",
        name: "module",
        parentId: "root",
        validate: { required: true },
        label: "Module"
    })
    .addTextField({
        id: "c6ecd70c-7420-4ea7-a715-d42699d26e6e",
        name: "nameSpace",
        parentId: "root",
        validate: { required: true },
        label: "Name"
    })
    .addSectionSeparator({
        id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
        name: 'separatorVisibility',
        parentId: 'root',
        label: 'Visibility',
    })
    .addCodeEditor({
        id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
        name: 'customVisibility',
        parentId: 'root',
        label: 'Custom Visibility',
        description:
            'Enter custom visibility code.  You must return true to show the component. ' + 
            'The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
        exposedVariables: [
            { id: nanoid(), name: 'value', description: 'Component current value', type: 'string | any' },
            { id: nanoid(), name: 'data', description: 'Selected form values', type: 'object' },
        ],
    })
    .toJson();