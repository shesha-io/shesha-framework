import React from 'react';
import { IToolboxComponent } from '../../interfaces';
import { IConfigurableFormComponent } from '../../providers/form/models';
import { FolderAddOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import StoredFilesProvider from '../../providers/storedFiles';
import { CustomFile } from '../../components';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '../../providers';
import {
  evaluateValue,
  executeCustomExpression,
  validateConfigurableComponentSettings,
} from '../../providers/form/utils';
import { getSettings } from './settings';

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
  maxHeight?: string;
}

const AttachmentsEditor: IToolboxComponent<IAttachmentsEditorProps> = {
  type: 'attachmentsEditor',
  name: 'File list',
  icon: <FolderAddOutlined />,
  factory: (model: IAttachmentsEditorProps) => {
    const { backendUrl } = useSheshaApplication();
    const { formMode, formSettings } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const ownerId = evaluateValue(model.ownerId, { data: data, globalState });

    const isEnabledByCondition = executeCustomExpression(model.customEnabled, true, data, globalState);

    return (
      <ConfigurableFormItem model={model}>
        <StoredFilesProvider
          ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
          ownerType={
            Boolean(model.ownerType) ? model.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
          }
          ownerName={model.ownerName}
          filesCategory={model.filesCategory}
          allCategories={!Boolean(model.filesCategory)}
          baseUrl={backendUrl}
        >
          <CustomFile
            isStub={formMode === 'designer'}
            allowAdd={!model.disabled && model.allowAdd && isEnabledByCondition}
            allowDelete={!model.disabled && model.allowDelete && isEnabledByCondition}
            allowReplace={!model.disabled && model.allowReplace && isEnabledByCondition}
            allowRename={!model.disabled && model.allowRename && isEnabledByCondition}
            allowedFileTypes={model.allowedFileTypes}
            maxHeight={model.maxHeight}
          />
        </StoredFilesProvider>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  migrator: (m) =>
    m.add<IAttachmentsEditorProps>(0, (prev) => {
      return {
        ...prev,
        allowAdd: true,
        allowDelete: true,
        allowReplace: true,
        allowRename: true,
        ownerId: '',
        ownerType: '',
        ownerName: '',
      };
    }),
};

export default AttachmentsEditor;
