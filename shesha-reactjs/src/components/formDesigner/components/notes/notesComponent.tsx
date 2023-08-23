import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { NotesRenderer, executeScriptSync, useFormData, useGlobalState } from '../../../../';
import { useForm } from '../../../../providers/form';
import { evaluateValue, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React from 'react';
import NotesProvider from '../../../../providers/notes';
import { getSettings } from './settings';

export interface INotesProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string;
  ownerIdExpression: string;
  ownerTypeExpression: string;
  savePlacement?: 'left' | 'right';
  autoSize?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const NotesComponent: IToolboxComponent<INotesProps> = {
  type: 'notes',
  name: 'Notes',
  icon: <FormOutlined />,
  factory: (model: INotesProps) => {
    const { isComponentHidden } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const ownerIdExpression = model?.ownerIdExpression
      ? executeScriptSync(model?.ownerIdExpression, { data, globalState })
      : null;
    const ownerTypeExpression = model?.ownerTypeExpression
      ? executeScriptSync(model?.ownerTypeExpression, { data, globalState })
      : null;

    // TODO:: Change to use Mustache
    const ownerId = evaluateValue(model.ownerId, { data });

    if (isComponentHidden(model)) return null;

    return (
      <NotesProvider ownerId={ownerIdExpression ?? ownerId} ownerType={ownerTypeExpression ?? model.ownerType}>
        <NotesRenderer
          showCommentBox={model.disabled !== true}
          buttonPostion={model?.savePlacement}
          autoSize={model?.autoSize}
        />
      </NotesProvider>
    );
  },
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => {
    const customModel: INotesProps = {
      ...model,
      ownerId: '{data.id}',
      ownerType: '',
    };
    return customModel;
  },
  settingsFormMarkup: (data) => getSettings(data),
};

export default NotesComponent;
