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
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

export interface IFileUploadProps extends IConfigurableFormComponent, Omit<IFormItem, 'name'> {
  ownerId: string;
  ownerType: string;
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  useSync?: boolean;
  allowedFileTypes?: string[];
  isDragger?: boolean;
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
                isDragger={model?.isDragger}
              />
            </StoredFileProvider>
          );
        }}
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
      isDragger: false,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IFileUploadProps>(0, prev => {
      return {
        ...prev,
        allowReplace: true,
        allowDelete: true,
        allowUpload: true,
        ownerId: prev['ownerId'],
        ownerType: prev['ownerType'],
        owner: prev['owner'],
      } as IFileUploadProps;
    })
    .add<IFileUploadProps>(1, (prev, context) => ({...prev, useSync: !Boolean(context.formSettings?.modelType)}))
    .add<IFileUploadProps>(2, (prev) => {
      // update propertyName from old propertyName field, not from name field
      const pn = prev.propertyName;
      const model = migratePropertyName(migrateCustomFunctions(prev));
      model.propertyName = pn;
      return model;
    })
  ,
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
};

export default FileUploadComponent;
