import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { NotesRenderer } from '@/components';
import { useFormData } from '@/providers';
import { evaluateValue, validateConfigurableComponentSettings } from '@/providers/form/utils';
import React from 'react';
import NotesProvider from '@/providers/notes';
import { migrateCustomFunctions, migrateFunctionToProp, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

export interface INotesProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string;
  ownerIdExpression: string;
  ownerTypeExpression: string;
  savePlacement?: 'left' | 'right';
  autoSize?: boolean;
  allowDelete?: boolean;
}

const NotesComponent: IToolboxComponent<INotesProps> = {
  type: 'notes',
  isInput: false,
  name: 'Notes',
  icon: <FormOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();

    // TODO:: Change to use Mustache
    const ownerId = evaluateValue(model.ownerId, { data });

    if (model.hidden) return null;

    return (
      <NotesProvider ownerId={ownerId} ownerType={model.ownerType}>
        <NotesRenderer
          showCommentBox={!model.readOnly}
          buttonPostion={model?.savePlacement}
          autoSize={model?.autoSize}
          allowDelete={model.allowDelete}
        />
      </NotesProvider>
    );
  },
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => {
    const customModel: INotesProps = {
      ...model,
      ownerId: '{data.id}',
      ownerType: '',
    };
    return customModel;
  },
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m
    .add<INotesProps>(0, (prev) =>
      migratePropertyName(
        migrateCustomFunctions(
          migrateFunctionToProp(
            migrateFunctionToProp(prev, 'ownerId', 'ownerIdExpression')
            , 'ownerType', 'ownerTypeExpression')
        )) as INotesProps)
    .add<INotesProps>(1, (prev) => migrateVisibility(prev))
    .add<INotesProps>(2, (prev) => migrateReadOnly(prev))
    .add<INotesProps>(3, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
};

export default NotesComponent;
