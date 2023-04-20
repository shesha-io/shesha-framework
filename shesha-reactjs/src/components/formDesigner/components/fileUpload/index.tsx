import { IFormItem, IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileAddOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { FileUpload } from '../../..';
import { StoredFileProvider, useFormData, useGlobalState, useSheshaApplication } from '../../../../providers';
import { useForm } from '../../../../providers/form';
import {
  evaluateValue,
  executeCustomExpression,
  validateConfigurableComponentSettings,
} from '../../../../providers/form/utils';
import React from 'react';

export interface IFileUploadProps extends IConfigurableFormComponent, IFormItem {
  ownerId: string;
  ownerType: string;
  propertyName: string;
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const FileUploadComponent: IToolboxComponent<IFileUploadProps> = {
  type: 'fileUpload',
  name: 'File',
  icon: <FileAddOutlined />,

  factory: (model: IFileUploadProps) => {
    const { backendUrl } = useSheshaApplication();

    // todo: refactor and implement a generic way for values evaluation
    const { data: formData } = useFormData();
    const { formMode, formSettings } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const ownerId = evaluateValue(model.ownerId, { data: formData, globalState });

    const readonly = formMode === 'readonly';
    const isEnabledByCondition = executeCustomExpression(model.customEnabled, true, formData, globalState);
    const enabled = !readonly && !model.disabled && isEnabledByCondition;

    return (
      <ConfigurableFormItem model={model}>
        <StoredFileProvider
          fileId={model.value?.Id ?? model.value}
          baseUrl={backendUrl}
          ownerId={Boolean(ownerId) ? ownerId : (Boolean(data?.id) ? data?.id : '')}
          ownerType={Boolean(model.ownerType) ? model.ownerType : (Boolean(formSettings?.modelType) ? formSettings?.modelType : '')}
          propertyName={Boolean(model.propertyName) ? model.propertyName : model.name}
          uploadMode={'async'}
        >
          <FileUpload
            isStub={formMode === 'designer'}
            allowUpload={enabled && model.allowUpload}
            allowDelete={enabled && model.allowDelete}
            allowReplace={enabled && model.allowReplace}
          />
        </StoredFileProvider>
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const customModel: IFileUploadProps = {
      ...model,
      allowReplace: true,
      allowDelete: true,
      allowUpload: true,
      ownerId: '{data.id}',
      ownerType: '',
      propertyName: '',
    };
    return customModel;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default FileUploadComponent;
