import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { NotesRenderer, useFormData } from '../../../../';
import { evaluateValue, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React from 'react';
import NotesProvider from '../../../../providers/notes';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

export interface INotesProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string;
  savePlacement?: 'left' | 'right';
  autoSize?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const NotesComponent: IToolboxComponent<INotesProps> = {
  type: 'notes',
  name: 'Notes',
  icon: <FormOutlined />,
  factory: (model: INotesProps) => {
    const { data: formData } = useFormData();
    const ownerId = evaluateValue(model.ownerId, { data: formData });

    if (model.hidden) return null;

    return (
      <NotesProvider ownerId={ownerId} ownerType={model.ownerType}>
        <NotesRenderer
          showCommentBox={model.disabled !== true}
          buttonPostion={model?.savePlacement}
          autoSize={model?.autoSize}
        />
      </NotesProvider>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => {
    const customModel: INotesProps = {
      ...model,
      ownerId: '{data.id}',
      ownerType: '',
    };
    return customModel;
  },
  migrator: (m) => m
    .add<INotesProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as INotesProps)
  ,
};

export default NotesComponent;
