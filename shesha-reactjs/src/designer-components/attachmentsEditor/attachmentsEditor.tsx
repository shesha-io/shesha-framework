import { FolderAddOutlined } from '@ant-design/icons';
import { App } from 'antd';
import moment from 'moment';
import React from 'react';
import { CustomFile } from '@/components';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { DataTypes, IToolboxComponent } from '@/interfaces';
import { IStyleType, useForm, useFormData, useGlobalState, useHttpClient, useSheshaApplication } from '@/providers';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import {
  evaluateValue,
  executeScript,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import StoredFilesProvider from '@/providers/storedFiles';
import { IStoredFile } from '@/providers/storedFiles/contexts';
import { getSettings } from './settings';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { containerDefaultStyles, defaultStyles } from './utils';
import { GHOST_PAYLOAD_KEY } from '@/utils/form';

export type layoutType = 'vertical' | 'horizontal' | 'grid';
export type listType = 'text' | 'thumbnail';
export interface IAttachmentsEditorProps extends IConfigurableFormComponent, IInputStyles {
  ownerId: string;
  ownerType: string;
  filesCategory?: string;
  allowedFileTypes?: string[];
  ownerName?: string;
  allowAdd: boolean;
  allowDelete: boolean;
  allowReplace: boolean;
  allowRename: boolean;
  isDragger?: boolean;
  maxHeight?: string;
  onFileChanged?: string;
  downloadZip?: boolean;
  filesLayout?: layoutType;
  listType: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  container?: IStyleType;
  primaryColor?: string;
  removeFieldFromPayload?: boolean;
}

const AttachmentsEditor: IToolboxComponent<IAttachmentsEditorProps> = {
  type: 'attachmentsEditor',
  isInput: true,
  name: 'File list',
  icon: <FolderAddOutlined />,
  dataTypeSupported: (dataTypeInfo) => dataTypeInfo.dataType === DataTypes.advanced && dataTypeInfo.dataFormat === 'attachmentsEditor',
  Factory: ({ model }) => {
    const { backendUrl } = useSheshaApplication();
    const httpClient = useHttpClient();
    const form = useForm();
    const { data } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { message } = App.useApp();

    const ownerId = evaluateValue(`${model.ownerId}`, { data: data, globalState });

    const enabled = !model.readOnly;

    const onFileListChanged = (fileList: IStoredFile[]) => {

      if (!model.onFileChanged)
        return;

      executeScript<void>(model.onFileChanged, {
        fileList,
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
      // Add GHOST_PAYLOAD_KEY to remove field from the payload
      // File list uses propertyName only for support Required feature
      <ConfigurableFormItem model={{ ...model, propertyName: !model.removeFieldFromPayload && model.propertyName ? model.propertyName : `${GHOST_PAYLOAD_KEY}_${model.propertyName}` }}>
        {(value, onChange) => {

          return (
            <StoredFilesProvider
              ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
              ownerType={
                Boolean(model.ownerType) ? model.ownerType : Boolean(form?.formSettings?.modelType) ? form?.formSettings?.modelType : ''
              }
              ownerName={model.ownerName}
              filesCategory={model.filesCategory}
              baseUrl={backendUrl}
              // used for requered field validation
              onChange={onChange}
              value={value}
            >
              <CustomFile
                isStub={form?.formMode === 'designer'}
                allowAdd={enabled && model.allowAdd}
                disabled={model.readOnly}
                allowDelete={enabled && model.allowDelete}
                allowReplace={enabled && model.allowReplace}
                allowRename={enabled && model.allowRename}
                allowedFileTypes={model.allowedFileTypes}
                maxHeight={model.maxHeight}
                isDragger={model?.isDragger}
                onFileListChanged={onFileListChanged}
                downloadZip={model.downloadZip}
                filesLayout={model.filesLayout}
                listType={model.listType}
                {...model}
                enableStyleOnReadonly={model.enableStyleOnReadonly}
                ownerId={ownerId}
              />
            </StoredFilesProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: () => getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  linkToModelMetadata: (model, metadata) => ({...model, ownerId: '{data.id}', ownerType: metadata.containerType, filesCategory: metadata.path}),
  migrator: (m) => m
    .add<IAttachmentsEditorProps>(0, (prev) => {
      return {
        ...prev,
        allowAdd: true,
        allowDelete: true,
        allowReplace: true,
        allowRename: true,
        isDragger: false,
        ownerId: '',
        ownerType: '',
        ownerName: '',
        listType: 'text',
        filesLayout: 'horizontal',
        hideFileName: true,
        editMode: 'inherited'
      };
    })
    .add<IAttachmentsEditorProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAttachmentsEditorProps>(2, (prev) => migrateVisibility(prev))
    .add<IAttachmentsEditorProps>(3, (prev) => migrateReadOnly(prev))
    .add<IAttachmentsEditorProps>(4, (prev) => ({ ...prev, downloadZip: true }))
    .add<IAttachmentsEditorProps>(5, (prev) => ({
      ...migrateFormApi.eventsAndProperties(prev),
      onFileChanged: migrateFormApi.withoutFormData(prev?.onFileChanged),
    }))
    .add<IAttachmentsEditorProps>(6, (prev) => ({ ...prev, listType: !prev.listType ? 'text' : prev.listType, filesLayout: prev.filesLayout ?? 'horizontal' }))
    .add<IAttachmentsEditorProps>(7, (prev) => ({ ...prev, desktop: { ...defaultStyles(), container: containerDefaultStyles() }, mobile: { ...defaultStyles() }, tablet: { ...defaultStyles() } })),
};

export default AttachmentsEditor;
