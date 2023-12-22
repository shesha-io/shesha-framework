import { FileSearchOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { useForm, useFormData, useGlobalState } from '@/providers';
import { IRefListStatusPropsV0 } from './migrations/models';
import { IRefListStatusProps } from './models';
import { RefListStatusSettingsForm } from './settings';
import { executeCustomExpression, getStyle } from '@/utils/publicUtils';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { RefListStatus } from '@/components/refListStatus/index';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const RefListStatusComponent: IToolboxComponent<IRefListStatusProps> = {
  type: 'refListStatus',
  isInput: true,
  name: 'Reference list status',
  icon: <FileSearchOutlined />,

  Factory: ({ model }) => {
    const { formMode, formData: data } = useForm();
    const { solidBackground = true, referenceListId, showReflistName = true } = model;

    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const isVisibleByCondition = executeCustomExpression(model?.customVisibility, true, formData, globalState);

    const style = {...getStyle(model.style, data, globalState)};

    if (!isVisibleByCondition && formMode !== 'designer') return null;

    if (formMode === 'designer' && !referenceListId) {
      return (
        <Alert
          showIcon
          message="ReflistStatus configuration is incomplete"
          description="Please make sure that you've select a reference list."
          type="warning"
        />
      );
    }
    
    return (
      <ConfigurableFormItem model={{ ...model }}>
        {(value) => {
          return (
            <RefListStatus
              value={value}
              referenceListId={model.referenceListId}
              showIcon={model.showIcon}
              showReflistName={showReflistName}
              solidBackground={solidBackground}
              style={style} />
          );
        }}
      </ConfigurableFormItem>
    );
  },

  initModel: (model) => {
    const customModel: IRefListStatusProps = {
      ...model,
      hideLabel: true
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IRefListStatusPropsV0>(0, (prev) => {
      const result: IRefListStatusPropsV0 = {
        ...prev,
        name: prev['name'],
        module: '',
        nameSpace: '',
      };
      return result;
    })
    .add<IRefListStatusProps>(1, (prev) => {
      const { module, nameSpace, ...restProps } = prev;
      const result: IRefListStatusProps = {
        ...restProps,
        referenceListId: nameSpace
          ? { module: module, name: nameSpace /* note the property was named wrong initially */ }
          : null,
      };
      return result;
    })
    .add<IRefListStatusProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRefListStatusProps>(3, (prev) => migrateVisibility(prev))
  ,
  settingsFormMarkup: RefListStatusSettingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(RefListStatusSettingsForm, model),
};

export default RefListStatusComponent;
