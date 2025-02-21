import { DesignerToolbarSettings } from '@shesha-io/reactjs';
import { nanoid } from 'nanoid';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: nanoid(),
      componentName: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addPropertyAutocomplete({
      id: nanoid(),
      propertyName: 'name',
      componentName: 'name',
      parentId: 'root',
      label: 'Name',
      validate: { required: true },
    })
    .addTextArea({
      id: nanoid(),
      propertyName: 'description',
      componentName: 'description',
      parentId: 'root',
      label: 'Description',
      autoSize: false,
      showCount: false,
      allowClear: false,
    })
    .addIconPicker({
      id: nanoid(),
      propertyName: 'image',
      componentName: 'image',
      label: 'Image',
      description: 'Customize image. Will treat as image url when string provided',
    })
    .addNumberField({
      id: nanoid(),
      propertyName: 'imageSize',
      componentName: 'imageSize',
      label: 'Size',
      defaultValue: 45,
    })
    .addTextArea({
      id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
      propertyName: 'customVisibility',
      componentName: 'customVisibility',
      parentId: 'root',
      label: 'Custom Visibility',
      autoSize: false,
      showCount: false,
      allowClear: false,
      description:
        'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    })
    .toJson();
