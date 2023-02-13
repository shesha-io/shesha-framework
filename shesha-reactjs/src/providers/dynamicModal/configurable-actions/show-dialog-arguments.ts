import { nanoid } from 'nanoid/non-secure';
import { IKeyValue } from '../../../interfaces/keyValue';
import { DesignerToolbarSettings } from '../../../interfaces/toolbarSettings';
import { FormIdentifier } from '../../form/models';

export interface IShowModalActionArguments {
  modalTitle: string;
  formId: FormIdentifier;
  showModalFooter: boolean;
  additionalProperties?: IKeyValue[];
  modalWidth?: number | string;
  customWidth?: number;
  widthUnits?: '%' | 'px';
  /**
   * If specified, the form data will not be fetched, even if the GET Url has query parameters that can be used to fetch the data.
   * This is useful in cases whereby one form is used both for create and edit mode
   */
  skipFetchData?: boolean;
  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';
}

export const dialogArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: '12C40CB0-4C60-4171-9380-01D51FDF6212',
    name: 'modalTitle',
    //parentId: 'root',
    label: 'Title',
    validate: { required: true },
  })
  .addFormAutocomplete({
    id: 'adbc3b29-9a53-4305-869a-f37ba6e8bb94',
    name: 'formId',
    label: 'Modal form',
    validate: {
      required: true,
    },
    convertToFullId: true,
  })
  .addCheckbox({
    id: 'c815c322-ba5d-4062-9736-e5d03c724134',
    name: 'showModalFooter',
    label: 'Show Modal Buttons',
  })
  .addDropdown({
    id: 'f15848e8-87fa-4d76-b5a4-8548b8c2dd8b',
    name: 'submitHttpVerb',
    label: 'Submit Http Verb',
    values: [
      {
        label: 'POST',
        value: 'POST',
        id: '8418606a-d85d-4795-a2ee-4a69fcc656f9',
      },
      {
        label: 'PUT',
        value: 'PUT',
        id: '64bbca8a-2fb1-4448-ab71-3db077233bd2',
      },
    ],
    dataSourceType: 'values',
    customVisibility: 'return data.showModalFooter === true',
    defaultValue: ['POST'],
    useRawValues: true,
  })
  .addLabelValueEditor({
    id: 'b395c0e9-dbc1-44f1-8fef-c18a49442871',
    name: 'additionalProperties',
    label: 'Additional properties',
    labelTitle: 'Key',
    labelName: 'key',
    valueTitle: 'Value',
    valueName: 'value',
    description:
      'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. Also note you can use Mustache expression like {{id}} for value property',
  })
  .addDropdown({
    id: '264903ff-b525-4a6e-893f-d560b219df9d',
    name: 'modalWidth',
    label: 'Dialog Width (%)',
    allowClear: true,
    values: [
      {
        label: 'Small',
        value: '40%',
        id: '2f56ae38-e5f3-40ff-9830-bc048736ddb4',
      },
      {
        label: 'Medium',
        value: '60%',
        id: '470d820b-7cd7-439c-8e95-1f5b3134f80c',
      },
      {
        label: 'Large',
        value: '80%',
        id: '1f2ac3db-3b3f-486c-991f-ad703088ab2d',
      },
      {
        label: 'Custom',
        value: 'custom',
        id: 'fde460b0-1f84-4b64-9a6a-e02ba862937d',
      },
    ],
    dataSourceType: 'values',
  })
  .addDropdown({
    id: nanoid(),
    name: 'widthUnits',
    label: 'Units',
    allowClear: true,
    values: [
      {
        label: 'Percentage (%)',
        value: '%',
        id: '2f56ae38-e5f3-40ff-9830-bc048736ddb4',
      },
      {
        label: 'Pixels (px)',
        value: 'px',
        id: '470d820b-7cd7-439c-8e95-1f5b3134f80c',
      },
    ],
    dataSourceType: 'values',
    customVisibility: 'return data.modalWidth === "custom"',
  })
  .addNumberField({
    id: nanoid(),
    name: 'customWidth',
    label: 'Enter Custom Width',
    customVisibility: 'return data.modalWidth === "custom" && data.widthUnits',
    min: 0,
  })
  .toJson();
