import { IToolboxComponent } from '../../interfaces';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import React from 'react';
import { useForm, useFormData, useGlobalState } from '../../providers';
import { IRefListStatusProps } from './models';
import { RefListStatusSettingsForm } from './settings';
import RefListStatusControl from './components/control';
import { validateConfigurableComponentSettings } from '../../formDesignerUtils';
import { executeCustomExpression } from '../../utils/publicUtils';
import { Alert } from 'antd';
import { IRefListStatusPropsV0 } from './migrations/models';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const RefListStatusComponent: IToolboxComponent<IRefListStatusProps> = {
  type: 'refListStatus',
  isInput: true,
  name: 'Reference list status',
  icon: <FileSearchOutlined />,

  factory: (model: IRefListStatusProps) => {
    const { formMode } = useForm();
    const { hideLabel = true, solidBackground = true, referenceListId, showReflistName = true } = model;

    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const isVisibleByCondition = executeCustomExpression(model?.customVisibility, true, formData, globalState);

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
      <ConfigurableFormItem model={{ ...model, hideLabel }}>
        {(value) => {
          return <RefListStatusControl model={{ ...model, solidBackground, showReflistName }} value={value} />;
        }}
      </ConfigurableFormItem>
    );
  },

  initModel: (model) => {
    const customModel: IRefListStatusProps = {
      ...model,
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
  ,
  settingsFormMarkup: RefListStatusSettingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(RefListStatusSettingsForm, model),
};

export default RefListStatusComponent;
