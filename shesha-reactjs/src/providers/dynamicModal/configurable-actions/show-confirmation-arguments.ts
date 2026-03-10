import { nanoid } from '@/utils/uuid';
import { FormMarkupFactory } from '@/interfaces/configurableAction';

export interface IShowConfirmationArguments {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  danger: boolean;
}

export const getShowConfirmationArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addSettingsInputRow({
    id: 'title-content-row',
    inputs: [
      {
        type: 'textField',
        id: nanoid(),
        propertyName: 'title',
        label: 'Title',
        validate: { required: true },
      },
      {
        id: nanoid(),
        type: 'textField',
        propertyName: 'content',
        label: 'Content',
        validate: { required: true },
      },
    ],
  })
    .addSettingsInputRow({
      id: 'oktext-canceltext-row',
      inputs: [
        {
          id: nanoid(),
          type: 'textField',
          propertyName: 'okText',
          label: 'Ok Text',
          validate: { required: true },
        },
        {
          id: nanoid(),
          type: 'textField',
          propertyName: 'cancelText',
          label: 'Cancel Text',
          validate: { required: true },
        },
      ],
    })
    .addSettingsInput({
      id: nanoid(),
      inputType: 'switch',
      propertyName: "danger",
      label: "Danger",
    })
    .toJson();
};
