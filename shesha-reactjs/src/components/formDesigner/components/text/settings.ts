import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces';
import {
  DEFAULT_CONTENT_DISPLAY,
  DEFAULT_CONTENT_TYPE,
  DEFAULT_PADDING_SIZE,
  FONT_SIZES,
  PADDING_SIZES,
} from './utils';

export const settingsFormMarkup = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
  })
  .addDropdown({
    id: nanoid(),
    name: 'textType',
    parentId: 'root',
    label: 'Type',
    allowClear: false,
    values: [
      {
        label: 'Span',
        value: 'span',
        id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
      },
      {
        label: 'Paragraph',
        value: 'paragraph',
        id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
      },
      {
        label: 'Title',
        value: 'title',
        id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
      },
    ],
    dataSourceType: 'values',
  })
  .addDropdown({
    id: nanoid(),
    name: 'contentDisplay',
    parentId: 'root',
    label: 'Content Display',
    allowClear: false,
    defaultValue: DEFAULT_CONTENT_DISPLAY,
    values: [
      {
        label: 'Content',
        value: 'content',
        id: 'ed3f59ac-baa9-4842-8744-4174340fc69b',
      },
      {
        label: 'Name',
        value: 'name',
        id: 'a232c553-fb24-4a44-af0a-067a803a7e83',
      },
    ],
    dataSourceType: 'values',
  })
  .addTextArea({
    id: 'b9857800-eb4d-4303-b1ac-6f9bc7f140ad',
    name: 'content',
    parentId: 'root',
    label: 'Content',
    validate: {
      required: true,
    },
    customVisibility: "return data.contentDisplay !== 'name'",
  })
  .addPropertyAutocomplete({
    id: '936859e7-0342-4a7d-a8f1-c2ae444defee',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
    customVisibility: "return data.contentDisplay === 'name'",
  })
  .addSectionSeparator({
    id: '0cf4cf1f-d94a-4fae-861d-b4a37c2c2c3a',
    name: 'separator2',
    parentId: 'root',
    label: 'Data type and format',
  })
  .addDropdown({
    id: '747589ce-a289-44b9-b713-01d072ac9d01',
    parentId: 'root',
    name: 'dataType',
    label: 'Data Type',
    defaultValue: 'string',
    values: [
      {
        id: '7f9bbdae-c7df-4fd4-8373-97cee736b51dv-',
        label: 'string',
        value: 'string',
      },
      {
        id: '9091637e-28ef-4d74-90eb-57dd0b6d5ee2',
        label: 'date time',
        value: 'date-time',
      },
      {
        id: '3bd07704-5593-4b4e-914f-fd3c551330bb',
        label: 'number',
        value: 'number',
      },
      {
        id: 'cc7c0357-b862-46ca-8e07-346e0cb8cf81',
        label: 'boolean',
        value: 'boolean',
      },
    ],
    dataSourceType: 'values',
  })
  .addTextField({
    id: '0a68e412-0636-451a-9add-cf7d461dcc17',
    parentId: 'root',
    name: 'dateFormat',
    label: 'Format',
    placeholder: 'Date Format',
    customVisibility: "return data.dataType === 'date-time'",
  })
  .addDropdown({
    id: 'd5bb0113-144e-4fb3-8246-e9a7f12462b9',
    parentId: 'root',
    name: 'numberFormat',
    label: 'Number format',
    defaultValue: 'round',
    values: [
      {
        id: '678d8042-00c7-46e6-b814-5fc2b10551fc',
        label: 'currency',
        value: 'currency',
      },
      {
        id: '56d2c101-cc9c-4340-8c2a-f9d10df62983',
        label: 'double',
        value: 'double',
      },
      {
        id: '737c0a7d-7248-4688-9f0e-2b6b6ceaef55',
        label: 'round',
        value: 'round',
      },
      {
        id: '503e356f-b159-4caf-be63-a2376586e2b0',
        label: 'thousand separator',
        value: 'thousandSeparator',
      },
    ],
    dataSourceType: 'values',
    customVisibility: "return data.dataType === 'number'",
  })
  .addSectionSeparator({
    id: nanoid(),
    name: 'separatorColor',
    label: 'Color',
  })
  .addDropdown({
    id: '6d29cf2c-96fe-40ce-be97-32e9f5d0fe40',
    name: 'contentType',
    parentId: 'root',
    label: 'Color',
    defaultValue: [DEFAULT_CONTENT_TYPE],
    values: [
      {
        label: 'Default',
        value: '',
        id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3c',
      },
      {
        label: 'Primary',
        value: 'primary',
        id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3e',
      },
      {
        label: 'Secondary',
        value: 'secondary',
        id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
      },
      {
        label: 'Success',
        value: 'success',
        id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
      },
      {
        label: 'Warning',
        value: 'warning',
        id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
      },
      {
        label: 'Info',
        value: 'info',
        id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
      },
      {
        label: 'Error',
        value: 'danger',
        id: '4b3830fa-6b2a-4493-a049-2a4a5be4b0a4',
      },
      {
        label: '(Custom Color)',
        value: 'custom',
        id: nanoid(),
      },
    ],
    dataSourceType: 'values',
  })
  .addColorPicker({
    id: nanoid(),
    name: 'color',
    label: 'Custom Color',
    title: 'Pick Content Color',
    customVisibility: "return data.contentType === 'custom'",
  })
  .addColorPicker({
    id: nanoid(),
    name: 'backgroundColor',
    label: 'Background Color',
    title: 'Pick Content Color',
  })
  .addSectionSeparator({
    id: nanoid(),
    name: 'separatorFont',
    label: 'Font',
  })
  .addDropdown({
    id: 'ccea671b-9144-4266-9cd7-64495cbc6910',
    name: 'level',
    parentId: 'root',
    label: 'Font Size',
    values: [
      {
        label: 'H1',
        value: '1',
        id: '81f0cd35-45b0-4d3e-8960-b6c9c3f7fb6f',
      },
      {
        label: 'H2',
        value: '2',
        id: 'a19ccf4a-27f0-45ae-819a-779668370639',
      },
      {
        label: 'H3',
        value: '3',
        id: '6a755f46-09a6-4e5e-b9fe-8617be7ef8e1',
      },
      {
        label: 'H4',
        value: '4',
        id: '3f8460ca-f50a-4cba-9b5d-6a2b02be14d2',
      },
      {
        label: 'H5',
        value: '5',
        id: '186a71a8-ead4-4bed-8a3b-bc197faac998',
      },
      ...Object.keys(FONT_SIZES).map(key => ({ id: nanoid(), value: key, label: key })),
    ],
    dataSourceType: 'values',
    customVisibility: "return data.textType ==='title'",
  })
  .addDropdown({
    id: nanoid(),
    name: 'fontSize',
    parentId: 'root',
    label: 'Font Size',
    values: Object.keys(FONT_SIZES).map(key => ({ id: nanoid(), value: key, label: key })),
    dataSourceType: 'values',
    customVisibility: "return data.textType !=='title'",
  })
  .addDropdown({
    id: '6edef969-8e4b-4495-92fa-12cd3430fa8e',
    name: 'padding',
    parentId: 'root',
    label: 'Padding',
    defaultValue: DEFAULT_PADDING_SIZE,
    values: [...Object.keys(PADDING_SIZES).map(key => ({ id: nanoid(), value: key, label: key }))],
    dataSourceType: 'values',
  })
  .addCheckbox({
    id: '3cd922a6-22b2-435f-8a46-8cca9fba8bea',
    name: 'code',
    parentId: 'root',
    label: 'Code style?',
  })
  .addCheckbox({
    id: 'aa17f452-0b07-473a-9c7a-986dfc2d37d9',
    name: 'italic',
    parentId: 'root',
    label: 'Italic',
  })
  .addCheckbox({
    id: '883498f1-1e05-479d-b119-d038cb7d398d',
    name: 'copyable',
    parentId: 'root',
    label: 'Copyable?',
  })
  .addCheckbox({
    id: '27cc9d42-1d07-4f70-a17c-50711d03acc5',
    name: 'keyboard',
    parentId: 'root',
    label: 'Keyboard style?',
  })
  .addCheckbox({
    id: '821d3a6c-abdb-4f11-b659-e562c75bada9',
    name: 'delete',
    parentId: 'root',
    label: 'Delete?',
  })
  .addCheckbox({
    id: '3a97e341-7f20-4479-9fa6-d8086e8b9a17',
    name: 'ellipsis',
    parentId: 'root',
    label: 'Ellipsis?',
  })
  .addCheckbox({
    id: '23f1f1d7-7eb8-440b-8620-bb059b6938e4',
    name: 'mark',
    parentId: 'root',
    label: 'Marked style?',
  })
  .addCheckbox({
    id: 'cbfdec6c-8fe5-4d35-b067-6c00de8ba311',
    name: 'strong',
    parentId: 'root',
    label: 'Strong?',
    customVisibility: "return data.textType !=='title'",
  })
  .addCheckbox({
    id: '12b8a36a-3aec-414c-942f-a57e37f00901',
    name: 'underline',
    parentId: 'root',
    label: 'Underline?',
  })
  .addSectionSeparator({
    id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
    name: 'sectionStyle',
    parentId: 'root',
    label: 'Style',
  })
  .addCodeEditor({
    id: '06ab0599-914d-4d2d-875c-765a495472f8',
    name: 'style',
    label: 'Style',
    parentId: 'root',
    validate: {},
    settingsValidationErrors: [],
    description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
    exposedVariables: [
      { id: '06ab0599-914d-4d2d-875c-765a495472f6', name: 'data', description: 'Form values', type: 'object' },
    ],
    mode: 'dialog',
  })
  .addSectionSeparator({
    id: '0aa7c480-a78b-11ed-afa1-0242ac120002',
    name: 'sectionVisibility',
    parentId: 'root',
    label: 'Visibility',
  })
  .addCodeEditor({
    id: '6a16626f-8e40-4507-9af7-8167d95f5553',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    mode: 'dialog',
  })
  .toJson();
