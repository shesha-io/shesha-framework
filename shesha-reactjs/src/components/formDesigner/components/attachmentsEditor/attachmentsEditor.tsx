import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FolderAddOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import StoredFilesProvider from '../../../../providers/storedFiles';
import { CustomFile } from '../../../';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '../../../../providers';
import {
  evaluateValue,
  executeCustomExpression,
  validateConfigurableComponentSettings,
} from '../../../../providers/form/utils';

export interface IAttachmentsEditorProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string;
  filesCategory?: number;
  allowAdd: boolean;
  allowDelete: boolean;
  allowReplace: boolean;
  allowRename: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

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
          ownerId={Boolean(ownerId) ? ownerId : (Boolean(data?.id) ? data?.id : '')}
          ownerType={Boolean(model.ownerType) ? model.ownerType : (Boolean(formSettings?.modelType) ? formSettings?.modelType : '')}
          filesCategory={model.filesCategory}
          baseUrl={backendUrl}
        >
          <CustomFile
            isStub={formMode === 'designer'}
            allowAdd={!model.disabled && model.allowAdd && isEnabledByCondition}
            allowDelete={!model.disabled && model.allowDelete && isEnabledByCondition}
            allowReplace={!model.disabled && model.allowReplace && isEnabledByCondition}
            allowRename={!model.disabled && model.allowRename && isEnabledByCondition}
          />
        </StoredFilesProvider>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customModel: IAttachmentsEditorProps = {
      ...model,
      allowAdd: true,
      allowDelete: true,
      allowReplace: true,
      allowRename: true,
      ownerId: '',
      ownerType: '',
    };
    return customModel;
  },
};

export default AttachmentsEditor;
