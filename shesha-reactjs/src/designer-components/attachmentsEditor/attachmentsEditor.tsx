import { FolderAddOutlined } from '@ant-design/icons';
import { message } from 'antd';
import moment from 'moment';
import React from 'react';
import { CustomFile } from '@/components';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import {
  evaluateValue,
  executeScript,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import StoredFilesProvider from '@/providers/storedFiles';
import { IStoredFile } from '@/providers/storedFiles/contexts';
import { axiosHttp } from '@/utils/fetchers';
import { getSettings } from './settings';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { GHOST_PAYLOAD_KEY } from '@/utils/form';

export interface IAttachmentsEditorProps extends IConfigurableFormComponent {
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
}

const AttachmentsEditor: IToolboxComponent<IAttachmentsEditorProps> = {
  type: 'attachmentsEditor',
  name: 'File list',
  icon: <FolderAddOutlined />,
  Factory: ({ model, form }) => {
    const { backendUrl } = useSheshaApplication();
    const { formMode, formSettings, setFormData } = useForm();
    const { data } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();

    const ownerId = evaluateValue(model.ownerId, { data: data, globalState });

    const enabled = !model.readOnly;

    const onFileListChanged = (fileList: IStoredFile[]) => {

      if (!model.onFileChanged) 
        return;

      executeScript<void>(model.onFileChanged, {
        fileList,
        data,
        form,
        formMode,
        globalState,
        http: axiosHttp(backendUrl),
        message,
        moment,
        setFormData,
        setGlobalState
      });
    };

    return (
      // Add GHOST_PAYLOAD_KEY to remove field from the payload
      // File list uses propertyName only for support Required feature
      <ConfigurableFormItem model={{...model, propertyName: `${GHOST_PAYLOAD_KEY}_${model.propertyName}`}}> 
        {(value, onChange) => {
          return (
            <StoredFilesProvider
              ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
              ownerType={
                Boolean(model.ownerType) ? model.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
              }
              ownerName={model.ownerName}
              filesCategory={model.filesCategory}
              baseUrl={backendUrl}
              
              // used for requered field validation
              onChange={onChange}
              value={value}
            >
              <CustomFile
                isStub={formMode === 'designer'}
                allowAdd={enabled && model.allowAdd}
                allowDelete={enabled && model.allowDelete}
                allowReplace={enabled && model.allowReplace}
                allowRename={enabled && model.allowRename}
                allowedFileTypes={model.allowedFileTypes}
                maxHeight={model.maxHeight}
                isDragger={model?.isDragger}
                onFileListChanged={onFileListChanged}
                downloadZip={model.downloadZip}
              />
            </StoredFilesProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
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
      };
    })
    .add<IAttachmentsEditorProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAttachmentsEditorProps>(2, (prev) => migrateVisibility(prev))
    .add<IAttachmentsEditorProps>(3, (prev) => migrateReadOnly(prev))
    .add<IAttachmentsEditorProps>(4, (prev) => ({...prev, downloadZip: true}))
  ,
};

export default AttachmentsEditor;
