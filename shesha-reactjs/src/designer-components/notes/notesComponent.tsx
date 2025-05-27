import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { NotesRenderer } from '@/components';
import { useForm, useFormData, useGlobalState, useHttpClient } from '@/providers';
import { evaluateValue, executeScript, validateConfigurableComponentSettings } from '@/providers/form/utils';
import React from 'react';
import NotesProvider from '@/providers/notes';
import { migrateCustomFunctions, migrateFunctionToProp, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getFormApi } from '@/providers/form/formApi';
import { App } from 'antd';
import moment from 'moment';

export interface INotesProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string;
  ownerIdExpression: string;
  ownerTypeExpression: string;
  savePlacement?: 'left' | 'right';
  autoSize?: boolean;
  allowDelete?: boolean;
  onCreated?: string;
}

const NotesComponent: IToolboxComponent<INotesProps> = {
  type: 'notes',
  isInput: false,
  name: 'Notes',
  icon: <FormOutlined />,
  Factory: ({ model }) => {
    const httpClient = useHttpClient();
    const form = useForm();
    const { data } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { message } = App.useApp();

    if (model.hidden) return null;

    const ownerId = evaluateValue(`${model.ownerId}`, { data: data, globalState });

    const onCreated = (createdNotes: Array<any>) => {
      if (!model.onCreated)
        return;

      executeScript<void>(model?.onCreated, {
        createdNotes,
        data,
        form: getFormApi(form),
        globalState,
        http: httpClient,
        message,
        moment,
        setGlobalState
      });
    };

    return (
      <NotesProvider ownerId={ownerId} ownerType={model.ownerType} uniqueIdentifier={model.componentName}>
        <NotesRenderer
          showCommentBox={!model.readOnly}
          buttonPostion={model?.savePlacement}
          autoSize={model?.autoSize}
          allowDelete={model.allowDelete}
          onCreated={onCreated}
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
      hideLabel: true,
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