import { IToolboxComponent } from '../../../../interfaces';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import React, { useMemo } from 'react';
import { useForm, useFormData, useGlobalState } from '../../../../providers';
import { IRefListStatusProps } from './models';
import { RefListStatusSettingsForm } from './settings';
import RefListStatusControl from './components/control';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { executeCustomExpression } from '../../../../utils/publicUtils';
import { Alert } from 'antd';

const RefListStatusComponent: IToolboxComponent<IRefListStatusProps> = {
  type: 'refListStatus',
  name: 'RefListStatus',
  icon: <FileSearchOutlined />,

  factory: (model: IRefListStatusProps) => {
    const { formMode } = useForm();
    const { hideLabel = true, solidBackground = true, module, nameSpace, showReflistName = true } = model;

    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const isVisibleByCondition = executeCustomExpression(model?.customVisibility, true, formData, globalState);

    if (!isVisibleByCondition && formMode !== 'designer') return null;

    const isRefListStatusComplte = useMemo(() => {
      return !!module && !!nameSpace;
    }, [module, nameSpace]);

    if (formMode === 'designer' && !isRefListStatusComplte) {
      return (
        <Alert
          showIcon
          message="ReflistStatus configuration is incomplete"
          description="Please make sure that you've specified 'module and namespace' properties."
          type="warning"
        />
      );
    }

    return (
      <ConfigurableFormItem model={{ ...model, hideLabel }}>
        <RefListStatusControl model={{ ...model, solidBackground, showReflistName }} />
      </ConfigurableFormItem>
    );
  },

  initModel: model => {
    const customModel: IRefListStatusProps = {
      ...model,
    };
    return customModel;
  },
  settingsFormMarkup: RefListStatusSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(RefListStatusSettingsForm, model),
};

export default RefListStatusComponent;
