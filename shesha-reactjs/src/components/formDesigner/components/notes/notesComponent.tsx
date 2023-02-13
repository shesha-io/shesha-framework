import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { NotesRenderer } from '../../../../';
import { useForm } from '../../../../providers/form';
import { evaluateValue, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React from 'react';
import NotesProvider from '../../../../providers/notes';

export interface INotesProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const NotesComponent: IToolboxComponent<INotesProps> = {
  type: 'notes',
  name: 'Notes',
  icon: <FormOutlined />,
  factory: (model: INotesProps) => {
    const { isComponentHidden } = useForm();

    const { formData } = useForm();
    const ownerId = evaluateValue(model.ownerId, { data: formData });

    if (isComponentHidden(model)) return null;

    return (
      <NotesProvider ownerId={ownerId} ownerType={model.ownerType}>
        <NotesRenderer showCommentBox={model.disabled !== true} />
      </NotesProvider>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customModel: INotesProps = {
      ...model,
      ownerId: '{data.id}',
      ownerType: '',
    };
    return customModel;
  },
};

export default NotesComponent;
