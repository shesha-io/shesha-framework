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

export interface IFileUploadProps extends IConfigurableFormComponent, IFormItem {
  ownerId: string;
  ownerType: string;
  propertyName: string;
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
        <StoredFileProvider
          fileId={model.value?.Id ?? model.value}
          baseUrl={backendUrl}
          ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
          ownerType={
            Boolean(model.ownerType) ? model.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
          }
          propertyName={Boolean(model.propertyName) ? model.propertyName : model.name}
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
      </ConfigurableFormItem>
    );
  },
  migrator: (m) =>
    m
      .add<IFileUploadProps>(0, (prev) => {
        return {
          ...prev,
          allowReplace: true,
          allowDelete: true,
          allowUpload: true,
          ownerId: '',
          ownerType: '',
          propertyName: '',
          uploadMode: 'button',
        };
      })
      .add<IFileUploadProps>(1, (prev, context) => {
        return {
          ...prev,
          useSync: !Boolean(context.formSettings?.modelType),
        };
      }),
  initModel: (model) => ({
    ...model,
    isDragger: false,
  }),
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
};

export default FileUploadComponent;
