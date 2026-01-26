import { FileAddOutlined } from '@ant-design/icons';
import React from 'react';
import { FileUpload } from '@/components';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { DataTypes } from '@/interfaces';
import { StoredFileProvider, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { useForm } from '@/providers/form';
import {
  evaluateValueAsString,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { FileUploadComponentDefinition, IFileUploadProps } from './interfaces';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

const FileUploadComponent: FileUploadComponentDefinition = {
  type: 'fileUpload',
  name: 'File',
  icon: <FileAddOutlined />,
  isInput: true,
  isOutput: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.file,
  Factory: ({ model }) => {
    const { backendUrl } = useSheshaApplication();

    const { dimensionsStyles } = useFormComponentStyles(model?.thumbnail);

    const finalStyle = (!model.enableStyleOnReadonly && model.readOnly) || model.listType === 'text' ? {
      ...model.allStyles.fontStyles,
      ...dimensionsStyles,
    } : { ...model.allStyles.fullStyle,
      ...dimensionsStyles };

    // TODO: refactor and implement a generic way for values evaluation
    const { formSettings, formMode } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const ownerId = evaluateValueAsString(model.ownerId, { data, globalState });

    const enabled = !model.readOnly;

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
              ownerType={!isEntityTypeIdEmpty(model.ownerType)
                ? model.ownerType
                : !isEntityTypeIdEmpty(formSettings?.modelType)
                  ? formSettings?.modelType
                  : ''}
              propertyName={model.propertyName}
              uploadMode={model.useSync ? 'sync' : 'async'}
            >
              <FileUpload
                {...model}
                isStub={formMode === 'designer'}
                allowUpload={enabled && model.allowUpload}
                allowDelete={enabled && model.allowDelete}
                allowReplace={enabled && model.allowReplace}
                allowedFileTypes={model?.allowedFileTypes}
                isDragger={model?.isDragger}
                style={finalStyle}
              />
            </StoredFileProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    const customModel: IFileUploadProps = {
      ...model,
      allowReplace: true,
      allowDelete: true,
      allowUpload: true,
      hideFileName: true,
      ownerId: '',
      ownerType: '',
      isDragger: false,
      editMode: 'inherited',
    };
    return customModel;
  },
  migrator: (m) =>
    m
      .add<IFileUploadProps>(0, (prev) => {
        return {
          ...prev,
          allowReplace: true,
          allowDelete: true,
          allowUpload: true,
          hideFileName: true,
          ownerId: prev['ownerId'],
          ownerType: prev['ownerType'],
          owner: prev['owner'],
        } as IFileUploadProps;
      })
      .add<IFileUploadProps>(1, (prev, context) => ({
        ...prev,
        useSync: prev.useSync === undefined ? isEntityTypeIdEmpty(context.formSettings?.modelType) : prev.useSync,
      }))
      .add<IFileUploadProps>(2, (prev) => {
        const pn = prev['name'] ?? prev.propertyName;
        const model = migratePropertyName(migrateCustomFunctions(prev));
        model.propertyName = pn;
        return model;
      })
      .add<IFileUploadProps>(3, (prev) => migrateVisibility(prev))
      .add<IFileUploadProps>(4, (prev) => migrateReadOnly(prev))
      .add<IFileUploadProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IFileUploadProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default FileUploadComponent;
