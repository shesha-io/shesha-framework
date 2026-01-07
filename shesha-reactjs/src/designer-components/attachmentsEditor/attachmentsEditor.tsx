import { FolderAddOutlined } from '@ant-design/icons';
import { App } from 'antd';
import moment from 'moment';
import React from 'react';
import { CustomFile } from '@/components';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IStoredFile, IToolboxComponent } from '@/interfaces';
import { useDataContextManagerActions, useForm, useFormData, useGlobalState, useHttpClient, useSheshaApplication } from '@/providers';
import { FormIdentifier, IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import {
  evaluateValue,
  executeScriptSync,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import StoredFilesProvider from '@/providers/storedFiles';
import { getSettings } from './settings';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { GHOST_PAYLOAD_KEY } from '@/utils/form';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { IDownloadedFileStyleType } from '@/components/customFile';

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
  allowViewHistory?: boolean;
  customActions?: ButtonGroupItemProps[];
  customContent?: boolean;
  extraFormId?: FormIdentifier;
  isDragger?: boolean;
  maxHeight?: string;
  onFileChanged?: string;
  onDownload?: string;
  downloadZip?: boolean;
  layout?: layoutType;
  listType: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  removeFieldFromPayload?: boolean;
  downloadedFileStyles?: IDownloadedFileStyleType;
  itemStyle?: string;
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
    const pageContext = useDataContextManagerActions(false)?.getPageContext();
    const ownerId = evaluateValue(`${model.ownerId}`, { data: data, globalState });

    const enabled = !model.readOnly;

    const executeScript = (script: string, value: unknown): void => {

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

    const hasExtraContent = Boolean(model?.customContent);

    return (
      // Add GHOST_PAYLOAD_KEY to remove field from the payload
      // File list uses propertyName only for support Required feature
      <ConfigurableFormItem model={{ ...model, propertyName: `${GHOST_PAYLOAD_KEY}_${model.id}` }}>
        {(value, onChange) => {
          const onFileListChanged = (fileList: IStoredFile[], isUserAction: boolean = false): void => {
            onChange(fileList);
            // Only execute custom script if this is a user action (upload/delete)
            if (isUserAction && model.onFileChanged) executeScript(model.onFileChanged, fileList);
          };

          const onDownload = (fileList: IStoredFile[], isUserAction: boolean = false): void => {
            onChange(fileList);
            // Only execute custom script if this is a user action (download)
            if (isUserAction && model.onDownload) executeScript(model.onDownload, fileList);
          };

          return (
            <StoredFilesProvider
              name={model.componentName}
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
                allowViewHistory={model.allowViewHistory}
                customActions={model.customActions}
                allowedFileTypes={model.allowedFileTypes}
                maxHeight={model.maxHeight}
                isDragger={model?.isDragger}
                downloadZip={model.downloadZip}
                layout={model.layout}
                listType={model.listType}
                hasExtraContent={hasExtraContent}
                extraFormId={model.extraFormId}
                {...model}
                itemStyle={model.itemStyle}
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
  initModel: (model) => ({
    ...model,
    allowViewHistory: true,
    customActions: [],  
  }),
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
        layout: 'horizontal',
        hideFileName: true,
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
    .add<IAttachmentsEditorProps>(6, (prev) => ({ ...prev, listType: !prev.listType ? 'text' : prev.listType, layout: prev.layout ?? 'horizontal' }))
    .add<IAttachmentsEditorProps>(7, (prev) => ({ ...prev, propertyName: prev.propertyName ?? '' })),
};

export default AttachmentsEditor;
