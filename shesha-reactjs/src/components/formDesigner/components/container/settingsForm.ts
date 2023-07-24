import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';
import {
  JUSTIFY_ITEMS,
  ALIGN_ITEMS,
  JUSTIFY_CONTENT,
  ALIGN_SELF,
  TEXT_JUSTIFY,
  JUSTIFY_SELF,
  FLEX_DIRECTION,
  FLEX_WRAP,
} from './data';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: '6c564664-cbc9-4cef-babc-6fbea44cd0ca',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addPropertyAutocomplete({
      id: '6d39921b-d20e-49cf-bc54-ec584f63be5c',
      propertyName: 'propertyName',
      parentId: 'root',
      label: 'Property name',
      validate: { required: true },
    })
    .addCheckbox({
      id: 'bf1823d6-dca4-408a-b7d8-5b42eacb076d',
      propertyName: 'hidden',
      parentId: 'root',
      label: 'Hidden',
    })
    .addCheckbox({
      id: 'c9900272-11c6-4484-be5b-e48c859f86e4',
      propertyName: 'noDefaultStyling',
      parentId: 'root',
      label: 'No Default Styling',
      description: 'If checked, the default styles and classes of the container will not be applied.',
    })
    .addDropdown({
      id: 'b83a044d-ea9f-4af1-8f71-696755e6323e',
      propertyName: 'visibility',
      parentId: 'root',
      label: 'Visibility',
      description:
        "This property will eventually replace the 'hidden' property and other properties that toggle visibility on the UI and payload",
      allowClear: true,
      dataSourceType: 'values',
      value: [
        {
          label: 'Yes (Display in UI and include in payload)',
          value: 'Yes',
          id: '53cd10ce-26af-474b-af75-8e7b1f19e51d',
        },
        {
          label: 'No (Only include in payload)',
          value: 'No',
          id: 'f07a228c-cb9c-4da7-a8bc-bc2be518a058',
        },
        {
          label: 'Removed (Remove from UI and exclude from payload)',
          value: 'Removed',
          id: '3b6282ee-2eee-47ec-bab9-4cba52b970a0',
        },
      ],
    })
    .addDropdown({
      id: 'dbad943d-d498-454b-b13e-6845b69c8df1',
      propertyName: 'display',
      label: 'Display',
      labelAlign: 'right',
      parentId: 'root',
      allowClear: false,
      hidden: false,
      customVisibility: null,
      dataSourceType: 'values',
      values: [
        {
          id: '4ca3ef53-be97-457b-bacb-7d0c0e9b535d',
          label: 'grid',
          value: 'grid',
        },
        {
          id: '219eff56-3005-4df1-9e52-5bd759a34bc2',
          label: 'block',
          value: 'block',
        },
        {
          id: 'f1b3f920-1537-4c2f-86bd-bec683dae879',
          label: 'flex',
          value: 'flex',
        },
        {
          id: '4f29e10f-f38f-48f5-b600-0920226493cc',
          label: 'inline-grid',
          value: 'inline-grid',
        },
      ],
      description:
        'The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.',
      validate: {
        required: true,
      },
    })
    .addDropdown({
      id: '5699c634-286d-4d7e-a804-8405d2cb1721',
      propertyName: 'flexDirection',
      label: 'Flex Direction',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.display === 'flex';",
      dataSourceType: 'values',
      values: FLEX_DIRECTION,
      description:
        'The flex-direction CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).',
    })
    .addDropdown({
      id: '2706b1e3-83dd-43a9-8800-183ec05f6359',
      propertyName: 'flexWrap',
      label: 'Flex Wrap',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.display === 'flex';",
      dataSourceType: 'values',
      values: FLEX_WRAP,
      description:
        'The flex-wrap CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.',
    })
    .addTextField({
      id: 'bccb0c08-6d9e-4257-9c40-129974850f4c',
      propertyName: 'gap',
      label: 'Gap',
      description: 'Examples of a valid gap include: `10` | `10px` | `20px 20px`',
      customVisibility: "return data.display && data.display !== 'block';",
    })
    .addNumberField({
      id: 'aae1d544-fe19-4865-9ef7-f885c72d8f61',
      propertyName: 'gridColumnsCount',
      label: 'Grid Columns Count',
      description: 'Number of columns each grid should have',
      customVisibility: "return data.display === 'grid' || data.display === 'inline-grid';",
    })
    .addDropdown({
      id: '3069d513-09bc-41c1-9f63-e47ecf56fb41',
      propertyName: 'direction',
      label: 'Direction',
      labelAlign: 'right',
      parentId: 'root',
      hidden: true,
      customVisibility: null,
      dataSourceType: 'values',
      values: [
        {
          id: 'f6410e20-49ce-45d0-90e3-49a8469a2c30',
          label: 'horizontal',
          value: 'horizontal',
        },
        {
          id: 'efd9da05-227c-43fb-b555-140561b6fefc',
          label: 'vertical',
          value: 'vertical',
        },
      ],
      validate: {
        required: true,
      },
    })
    .addDropdown({
      id: '2b17e6cf-0140-47e2-a5a8-f728544b8ef2',
      propertyName: 'alignItems',
      label: 'Align Items',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.direction !== 'block';",
      dataSourceType: 'values',
      values: ALIGN_ITEMS,
      validate: {},
      description:
        'The CSS align-items property sets the align-self value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.',
    })
    .addDropdown({
      id: 'b9fc3571-5f6e-4bac-8ec9-9313a2e0f695',
      propertyName: 'alignSelf',
      label: 'Align Self',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.direction !== 'block';",
      dataSourceType: 'values',
      values: ALIGN_SELF,
      validate: {},
      description:
        "The align-self CSS property overrides a grid or flex item's align-items value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.",
    })
    .addDropdown({
      id: '41e13a88-21b5-4577-adbf-2f4ef09e5ffc',
      propertyName: 'justifyContent',
      label: 'Justify Content',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.direction !== 'block';",
      dataSourceType: 'values',
      values: JUSTIFY_CONTENT,
      validate: {},
      description:
        'The CSS justify-content property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.',
    })
    .addDropdown({
      id: 'daa3b98e-c6bc-4883-ae54-143756579c51',
      propertyName: 'justifySelf',
      label: 'Justify Self',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.direction !== 'block';",
      dataSourceType: 'values',
      values: JUSTIFY_SELF,
      validate: {},
      description:
        'The CSS justify-self property sets the way a box is justified inside its alignment container along the appropriate axis.',
    })
    .addDropdown({
      id: 'a089965c-f1ca-45b1-8f2f-2c8355cc83f9',
      propertyName: 'textJustify',
      label: 'Text Justify',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.direction !== 'block';",
      dataSourceType: 'values',
      values: TEXT_JUSTIFY,
      validate: {},
      description:
        'The text-justify CSS property sets what type of justification should be applied to text when text-align: justify; is set on an element.',
    })
    .addDropdown({
      id: '2d75b63f-cee9-44b5-afb7-db1d8f05f005',
      propertyName: 'justifyItems',
      label: 'Justify Items',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: "return data.direction !== 'block';",
      dataSourceType: 'values',
      values: JUSTIFY_ITEMS,
      validate: {},
      description:
        'The CSS justify-items property defines the default justify-self for all items of the box, giving them all a default way of justifying each box along the appropriate axis.',
    })
    .addTextField({
      textType: 'text',
      id: '648fea09-e548-44b3-9c90-2187ad63fd07',
      propertyName: 'className',
      label: 'Custom CSS Class',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      description: 'Custom CSS Class to add to this component',
      validate: {},
      settingsValidationErrors: [],
    })
    .addSectionSeparator({
      id: 'db6e32f3-7a8b-4686-a0db-81b2e36796ef',
      propertyName: 'separatorStyle',
      parentId: 'root',
      label: 'Style',
    })
    .addCodeEditor({
      id: '4e319199-d27c-4ed0-9934-fa2cb62745d1',
      propertyName: 'style',
      label: 'Style',
      parentId: 'root',
      mode: 'dialog',
      description: 'The style that will be applied to the container',
      exposedVariables: [{ id: nanoid(), name: 'data', description: 'Form data', type: 'object' }],
    })
    .addCodeEditor({
      id: '71b5da4f-9300-41bf-b0c4-9d9f3757d402',
      propertyName: 'wrapperStyle',
      label: 'Wrapper Style',
      parentId: 'root',
      mode: 'dialog',
      description: 'The style that will be applied to the container wrapper',
      exposedVariables: [{ id: nanoid(), name: 'data', description: 'Form data', type: 'object' }],
      customVisibility: 'return !data.noDefaultStyling;',
    })
    .addSectionSeparator({
      id: 'be03d9ef-14de-4282-9164-05ea0376baf1',
      propertyName: 'separatorVisibility',
      parentId: 'root',
      label: 'Visibility',
    })
    .addCodeEditor({
      id: 'acc821f1-bd62-4ae9-992a-e1c19a1972af',
      propertyName: 'customVisibility',
      label: 'Custom Visibility',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      description:
        'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        { id: nanoid(), name: 'value', description: 'Component current value', type: 'string | any' },
        { id: nanoid(), name: 'data', description: 'Selected form values', type: 'object' },
      ],
    })
    .toJson();
