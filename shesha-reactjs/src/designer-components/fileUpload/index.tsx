import { IFormItem, IToolboxComponent } from 'interfaces';
import { IConfigurableFormComponent } from 'providers/form/models';
import { FileAddOutlined } from '@ant-design/icons';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import { FileUpload } from 'components';
import { StoredFileProvider, useFormData, useGlobalState, useSheshaApplication } from 'providers';
import { useForm } from 'providers/form';
import {
  evaluateValue,
  executeCustomExpression,
  validateConfigurableComponentSettings,
} from '../../providers/form/utils';
import React from 'react';
import { getSettings } from './settings';
import { migrateDisabled, migrateHidden, migratePropertyName } from 'designer-components/_settings/utils';

export interface IFileUploadProps extends IConfigurableFormComponent, Omit<IFormItem, 'name'> {
  ownerId: string;
  ownerType: string;
  propertyName: string;
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  useSync?: boolean;
  allowedFileTypes?: string[];
}

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
        {(value, onChange) => {
          return (
            <StoredFileProvider
              value={value}
              onChange={onChange}
              fileId={model.value?.Id ?? model.value}
              baseUrl={backendUrl}
              ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
              ownerType={
                Boolean(model.ownerType) ? model.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
              }
              propertyName={Boolean(model.propertyName) ? model.propertyName : model.propertyName}
              uploadMode={model.useSync ? 'sync' : 'async'}
            >
              <FileUpload
                isStub={formMode === 'designer'}
                allowUpload={enabled && model.allowUpload}
                allowDelete={enabled && model.allowDelete}
                allowReplace={enabled && model.allowReplace}
                allowedFileTypes={model?.allowedFileTypes}
              />
            </StoredFileProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<IFileUploadProps>(0, prev => {
      return {
        ...prev,
        allowReplace: true,
        allowDelete: true,
        allowUpload: true,
        ownerId: '',
        ownerType: '',
        propertyName: '',
      } as IFileUploadProps;
    })
    .add<IFileUploadProps>(1, (prev, context) => ({...prev, useSync: !Boolean(context.formSettings?.modelType)}))
    .add<IFileUploadProps>(2, (prev) => {
      const newModel = {...prev};
      migrateHidden(newModel);
      migrateDisabled(newModel);
      return newModel;
    })
    .add<IFileUploadProps>(3, (prev) => migratePropertyName(prev))
  ,
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
};

export default FileUploadComponent;
