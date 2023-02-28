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
  name: 'File Upload',
  icon: <FileAddOutlined />,

  factory: (model: IFileUploadProps) => {
    const { backendUrl } = useSheshaApplication();

    // todo: refactor and implement a generic way for values evaluation
    const { data: formData } = useFormData();
    const { formMode } = useForm();
    const { globalState } = useGlobalState();
    const ownerId = evaluateValue(model.ownerId, { data: formData, globalState });

    const isEnabledByCondition = executeCustomExpression(model.customEnabled, true, formData, globalState);

    return (
      <ConfigurableFormItem model={model}>
        <StoredFileProvider
          baseUrl={backendUrl}
          ownerId={ownerId}
          ownerType={model.ownerType}
          propertyName={model.propertyName}
          uploadMode={ownerId ? 'async' : 'sync'}
        >
          <FileUpload
            isStub={formMode === 'designer'}
            allowUpload={!model.disabled && model.allowUpload && isEnabledByCondition}
            allowDelete={!model.disabled && model.allowDelete && isEnabledByCondition}
            allowReplace={!model.disabled && model.allowReplace && isEnabledByCondition}
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
