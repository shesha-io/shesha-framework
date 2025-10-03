import { FolderAddOutlined } from '@ant-design/icons';
import { App } from 'antd';
import moment from 'moment';
import React from 'react';
import { CustomFile } from '@/components';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { IStyleType, useDataContextManagerActions, useForm, useFormData, useGlobalState, useHttpClient, useSheshaApplication } from '@/providers';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import {
  evaluateValue,
  executeScriptSync,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import StoredFilesProvider from '@/providers/storedFiles';
import { getSettings } from './settings';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { GHOST_PAYLOAD_KEY } from '@/utils/form';
import { containerDefaultStyles, defaultStyles } from './utils';

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
  onDownload?: string;
  downloadZip?: boolean;
  filesLayout?: layoutType;
  listType: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  container?: IStyleType;
  primaryColor?: string;
}

const AttachmentsEditor: IToolboxComponent<IAttachmentsEditorProps> = {
  type: 'attachmentsEditor',
  isInput: true,
  name: 'File list',
  icon: <FolderAddOutlined />,
  Factory: ({ model }) => {
    const { backendUrl } = useSheshaApplication();
    const httpClient = useHttpClient();
    const form = useForm();
    const { data } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { message } = App.useApp();
    const pageContext = useDataContextManagerActions()?.getPageContext();
    const ownerId = evaluateValue(`${model.ownerId}`, { data: data, globalState });

    const enabled = !model.readOnly;

    const executeScript = (script, value) => {
      executeScriptSync(script, {
        value,
        data,
        form: getFormApi(form),
        globalState,
        http: httpClient,
        message,
        moment,
        setGlobalState,
        pageContext,
      });
    };

    return (
      // Add GHOST_PAYLOAD_KEY to remove field from the payload
      // File list uses propertyName only for support Required feature
      <ConfigurableFormItem model={{ ...model, propertyName: model.propertyName || `${GHOST_PAYLOAD_KEY}_${model.id}` }}>
        {(value, onChange) => {
          const onFileListChanged = (fileList) => {
            onChange(fileList);
            if (model.onChangeCustom) executeScript(model.onChangeCustom, fileList);
          };

          const onDownload = (fileList) => {
            onChange(fileList);
            if (model.onDownload) executeScript(model.onDownload, fileList);
          };

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
              onChange={onFileListChanged}
              onDownload={onDownload}
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
  linkToModelMetadata: (model, metadata) => ({ ...model, ownerId: '{data.id}', ownerType: metadata.containerType, filesCategory: metadata.path }),
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
        editMode: 'inherited',
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
    .add<IAttachmentsEditorProps>(7, (prev) => ({ ...prev, desktop: { ...defaultStyles(), container: containerDefaultStyles() }, mobile: { ...defaultStyles() }, tablet: { ...defaultStyles() } }))
    .add<IAttachmentsEditorProps>(8, (prev) => ({ ...prev, downloadZip: prev.downloadZip || false, propertyName: prev.propertyName ?? '', onChangeCustom: prev.onFileChanged })),
};

export default AttachmentsEditor;
