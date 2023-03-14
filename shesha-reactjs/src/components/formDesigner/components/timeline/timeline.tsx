import React, { useMemo, useState } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ClockCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import ConfigurableFormItem from '../formItem';

import { DataTypes } from '../../../../interfaces/dataTypes';
import { FormIdentifier, useForm, useFormData, useGlobalState, useSheshaApplication } from '../../../../providers';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import ComponentsContainer, { ICommonContainerProps } from '../../componentsContainer';
import TimelineSettings from './settings';
import { axiosHttp } from '../../../../apis/axios';
import moment from 'moment';
import ShaIcon from '../../../shaIcon';
import { ShaTimeline } from '../../../timeline/index';
import { evaluateValue } from '../../../../providers/form/utils';

export interface ITimelineProps extends IConfigurableFormComponent, ICommonContainerProps {
  useExpression: string | boolean;
  entityType: string;
  permissions?: any;
  buttonsLayout?: any;
  properties?: string[];
  defaultActiveItem?: any;
  formId?: FormIdentifier;
  ownerId: string;
  queryParamsExpression?: string;
  readOnly?: boolean;
  labelPlacement?: any;
  activeItem: any;
  dataSource?: 'form' | 'api';
  customApiUrl?: string;
  filters?: object;
  apiSource?: 'entity' | 'custom';
  components?: IConfigurableFormComponent[];
  items?: any;
  timelineType?: 'default' | 'vertical' | 'horizontal';
}

const TimelineComponent: IToolboxComponent<ITimelineProps> = {
  type: 'timeline',
  name: 'Timeline',
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,

  factory: (model: ITimelineProps) => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const { formMode, isComponentDisabled, formData } = useForm();
    const isReadOnly = model?.readOnly || formMode === 'readonly';
    const { items } = model;
    const [components] = useState<IConfigurableFormComponent[]>();

    const { globalState, setState: setGlobalState } = useGlobalState();

    const executeExpression = (expression: string, returnBoolean = true) => {
      if (!expression) {
        if (returnBoolean) {
          return true;
        } else {
          console.error('Expected expression to be defined but it was found to be empty.');
          return false;
        }
      }

      /* tslint:disable:function-constructor */
      const evaluated = new Function('data, formMode, globalState, http, message, setGlobalState, moment', expression)(
        formData,
        formMode,
        globalState,
        axiosHttp(''),
        message,
        setGlobalState,
        moment
      );

      // tslint:disable-next-line:function-constructor
      return typeof evaluated === 'boolean' ? evaluated : true;
    };

    const disabled = isComponentDisabled(model);

    const visibleItems = useMemo(
      () =>
        items?.filter(({ customVisibility, permissions }) => {
          const granted = anyOfPermissionsGranted(permissions || []);
          const isVisibleByCondition = executeExpression(customVisibility, true);

          return !((!granted || !isVisibleByCondition) && formMode !== 'designer');
        }),
      [items]
    );

    const timelineItems = visibleItems?.map(({ id, title, subTitle, description, icon, customEnabled }) => {
      const isDisabledByCondition = !executeExpression(customEnabled, true) && formMode !== 'designer';

      const iconProps = icon ? { icon: <ShaIcon iconName={icon as any} /> } : {};
      return {
        id,
        title,
        subTitle,
        description,
        disabled: isDisabledByCondition,
        ...iconProps,
        content: (
          <ComponentsContainer
            containerId={id}
            dynamicComponents={model?.isDynamic ? components?.map((c) => ({ ...c, readOnly: model?.readOnly })) : []}
          />
        ),
      };
    });

    const ownerId = evaluateValue(model.ownerId, { data: formData });

    return (
      <ConfigurableFormItem model={{ ...model }} valuePropName="checked" initialValue={model?.defaultValue}>
        {isReadOnly ? (
          <ReadOnlyDisplayFormItem type="checkbox" disabled={disabled} />
        ) : (
          <ShaTimeline {...model} ownerId={ownerId} items={timelineItems} />
        )}
      </ConfigurableFormItem>
    );
  },

  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <TimelineSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

export default TimelineComponent;
