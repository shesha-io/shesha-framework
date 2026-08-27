import { FC, useMemo } from 'react';
import { FormOutlined } from '@ant-design/icons';
import { DataTypes } from '@/interfaces';
import { AdvancedFormats } from '@/interfaces/dataTypes';
import { NotesRenderer } from '@/components/notesRenderer';
import { useFormData, useGlobalState } from '@/providers';
import { evaluateString, executeScript, useAvailableConstantsData } from '@/providers/form/utils';
import {
  NotesEditorProvider,
  OnNoteCreatedFunc,
  OnNoteDeletedFunc,
  OnNoteUpdatedFunc,
  useNotesEditorActions,
  useNotesEditorState,
} from '@/providers/notes';
import {
  migrateCustomFunctions,
  migrateFunctionToProp,
  migrateHiddenToVisible,
  migratePropertyName,
  migrateReadOnly,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { useComponentApi } from '@/providers/componentApi/hooks';
import { NotesApi } from '@/componentsApi/componentApi';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';
import { INotesComponentProps, INotesComponentPropsV1, NotesComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useStyles } from './styles';

/** Events the component emits at both the settings form and the runtime, kept in one place so the two cannot drift. */
const NOTES_EVENTS = ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'] as const;

/**
 * Registers the component API from inside `NotesEditorProvider`, which is where the notes state and
 * the create/delete actions actually live — they are not reachable from the Factory itself.
 */
const NotesApiRegistrar: FC<{ model: INotesComponentProps; ownerId: string }> = ({ model, ownerId }) => {
  const { notes, isFetchingNotes } = useNotesEditorState();
  const { createNoteAsync, deleteNoteAsync } = useNotesEditorActions();

  useComponentApi<NotesApi>({
    model,
    typeName: 'NotesApi',
    properties: [
      { name: 'notes', getter: () => notes },
      { name: 'ownerId', getter: () => ownerId },
      { name: 'category', getter: () => model.category },
      { name: 'isFetchingNotes', getter: () => isFetchingNotes },
    ],
    api: {
      createNote: (noteText: string) => createNoteAsync({ noteText }),
      deleteNote: (id: string) => deleteNoteAsync({ id }),
    },
  }, [notes, isFetchingNotes, ownerId, model.category, createNoteAsync, deleteNoteAsync]);

  return null;
};

const NotesComponent: NotesComponentDefinition = {
  allowInherit: true,
  type: 'notes',
  isInput: false,
  name: 'Notes',
  icon: <FormOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: (dataTypeInfo) => dataTypeInfo.dataType === DataTypes.advanced && dataTypeInfo.dataFormat === AdvancedFormats.notes,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const executionContext = useAvailableConstantsData();
    const { styles } = useStyles(model);

    const handleEvent = useEvents<void>(model.componentName);
    const events = useMemo(
      () => getComponentEvents<void>(model, [...NOTES_EVENTS], { handleEvent }),
      [handleEvent, model],
    );

    // evaluateString always returns a string, so no fallback is needed here
    const ownerId = evaluateString(model.ownerId, { data: data, globalState });

    const handleCreateAction: OnNoteCreatedFunc = (note) => {
      if (!isNotNullOrWhiteSpace(model.onCreateAction)) return;

      executeScript<void>(model.onCreateAction, {
        createdNotes: [note],
        ...executionContext,
      }).catch((error) => {
        console.error('Failed to execute onCreateAction', error);
        throw error;
      });
    };
    const handleDeleteAction: OnNoteDeletedFunc = (note) => {
      if (!isNotNullOrWhiteSpace(model.onDeleteAction)) return;

      executeScript<void>(model.onDeleteAction, {
        note,
        ...executionContext,
      }).catch((error) => {
        console.error('Failed to execute onDeleteAction', error);
        throw error;
      });
    };
    const handleUpdateAction: OnNoteUpdatedFunc = (note) => {
      if (!isNotNullOrWhiteSpace(model.onUpdateAction)) return;

      executeScript<void>(model.onUpdateAction, {
        note,
        ...executionContext,
      }).catch((error) => {
        console.error('Failed to execute onUpdateAction', error);
        throw error;
      });
    };

    /* Read only renders the notes as a pure viewer - the editor is hidden entirely. Disabled keeps
       the editor on screen but inert, which is what the greyed-out state means for a control the
       user can see but not use. The two are separate booleans, so both are read explicitly. */
    const isReadOnly = model.readOnly === true;
    const isDisabled = model.disabled === true;

    return (
      <NotesEditorProvider
        ownerId={ownerId}
        ownerType={model.ownerType ?? ''}
        category={model.category}
        onCreatedAction={handleCreateAction}
        onUpdatedAction={handleUpdateAction}
        onDeletedAction={handleDeleteAction}
      >
        <NotesApiRegistrar model={model} ownerId={ownerId} />
        <NotesRenderer
          className={styles.notes}
          {...events}

          allowCreate={!isReadOnly}
          allowUpdate={model.allowEdit}
          allowDelete={model.allowDelete}
          disabled={isDisabled}

          buttonPostion={model.savePlacement}
          autoSize={model.autoSize}
          showCharCount={model.showCharCount}
          minLength={model.minLength}
          maxLength={model.maxLength}
        />
      </NotesEditorProvider>
    );
  },

  /* Only the properties the component cannot work without are seeded here. `ownerType` is left
     undefined on purpose: `linkToModelMetadata` is merged under the model, so any value set here -
     including an empty string - would shadow the entity type inherited from the metadata. */
  initModel: (model) => ({
    ...model,
    ownerId: '{data.id}',
    hideLabel: true,
  }),
  settingsFormMarkup: getSettings,
  getDefaultStyles: () => defaultStyles(),
  linkToModelMetadata: (model, metadata) => ({
    ...model,
    ownerId: '{data.id}',
    ...(isNotNullOrWhiteSpace(metadata.entityType)
      ? { ownerType: { module: metadata.entityModule ?? '', name: metadata.entityType } }
      : {}),
    category: metadata.path,
  }),
  getFieldsToFetch: () => [],
  migrator: (m) =>
    m
      .add<INotesComponentPropsV1>(
        0,
        (prev) =>
          migratePropertyName(
            migrateCustomFunctions(
              migrateFunctionToProp(
                migrateFunctionToProp(prev, 'ownerId', 'ownerIdExpression'),
                'ownerType',
                'ownerTypeExpression',
              ),
            ),
          ) as INotesComponentPropsV1,
      )
      .add<INotesComponentPropsV1>(1, (prev) => migrateVisibility(prev))
      .add<INotesComponentPropsV1>(2, (prev) => migrateReadOnly(prev))
      .add<INotesComponentPropsV1>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<INotesComponentPropsV1>(4, (prev) => ({
        ...prev,
        allowEdit: prev.allowEdit ?? false,
      }))
      /* Freezes the appearance of components already on saved forms by baking the real defaults into
         all three device models, so they keep rendering as they do today when the code-level
         defaults change. A newly dropped component skips it and inherits instead. */
      .add<INotesComponentPropsV1>(5, (prev, context) => context.isNew === true
        ? prev
        : { ...migratePrevStyles(prev, defaultStyles()) })
      .add<INotesComponentProps>(6, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  previewConfiguration: {
    type: 'notes',
    id: 'notes',
    propertyName: 'notesAppearance',
    label: 'Notes Label',
    hideLabel: true,
    ownerId: '',
    ownerType: '',
    allowEdit: true,
    allowDelete: true,
    showCharCount: true,
    version: 'latest',
  },
};

export default NotesComponent;
