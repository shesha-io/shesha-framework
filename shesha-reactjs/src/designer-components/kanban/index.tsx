import { FormOutlined } from '@ant-design/icons';

import React, { useCallback, useMemo } from 'react';
import { getSettings } from './settings';
import { IKanbanProps } from './model';
import { ConfigurableFormItem } from '@/components';
import { axiosHttp, IToolboxComponent, useForm, useFormData, useSheshaApplication, validateConfigurableComponentSettings } from '@/index';
import { executeExpression, getStyle } from '@/providers/form/utils';
import { customEventHandler } from '@/components/formDesigner/components/utils';
import  { useGlobalState } from '@/providers/globalState';
import { Alert, message } from 'antd';
import moment from 'moment';
import { getFormApi } from '@/providers/form/formApi';
import KanbanReactComponent from '@/components/kanban';
import { IncomeValueFunc, OutcomeValueFunc } from '@/components/entityPicker/models';
import { ITableViewProps } from '@/providers/dataTable/filters/models';

const KanbanComponent: IToolboxComponent<IKanbanProps> = {
  type: 'kanban',
  isInput: false,
  name: 'Kanban',
  icon: <FormOutlined />,

  Factory: ({ model }) => {
    const form = useForm();
    const { data: formData } = useFormData();
    const { backendUrl } = useSheshaApplication();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { filters, modalWidth, customWidth, widthUnits } = model;
    const eventProps = {
      model,
      form: getFormApi(form),
      formData,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setGlobalState,
    };
    
    const entityPickerFilter = useMemo<ITableViewProps[]>(() => {
      return [
        {
          defaultSelected: true,
          expression: { ...filters },
          id: 'uZ4sjEhzO7joxO6kUvwdb',
          name: 'entity Picker',
          selected: true,
          sortOrder: 0,
        },
      ];
    }, [filters]);

    const incomeValueFunc: IncomeValueFunc = useCallback( (value: any, args: any) => {
      if (model.valueFormat === 'entityReference') {
        return !!value ? value.id : null;
      }
      if (model.valueFormat === 'custom') {
        return executeExpression<string>(model.incomeCustomJs, {...args, value}, null, null );
      }
      return value;
    }, [model.valueFormat, model.incomeCustomJs]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((value: any, args: any) => {
      if (model.valueFormat === 'entityReference') {
        return !!value
          ? {id: value.id, _displayName: value[model.displayEntityKey] ??  value._displayName, _className: model.entityType}
          : null;
      }
      if (model.valueFormat === 'custom') {
        return executeExpression(model.outcomeCustomJs, {...args, value}, null, null );
      }
      return !!value ? value.id : null;
    }, [model.valueFormat, model.outcomeCustomJs, model.displayEntityKey, model.entityType]);

    if (form.formMode === 'designer' && !model.entityType) {
      return (
        <Alert
          showIcon
          message="EntityPicker not configured properly"
          description="Please make sure that you've specified 'entityType' property."
          type="warning"
        />
      );
    }
    return (
      <div>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            const customEvent = customEventHandler(eventProps);
            const onChangeInternal = (...args: any[]) => {
              customEvent.onChange(args[0]);
              if (typeof onChange === 'function')
                onChange(...args);
            };
            return (
              <KanbanReactComponent
                onChange={onChange}
                {...model}
                filters={entityPickerFilter}
                headerStyle={{
                  ...getStyle(model?.headerStyle, formData),
                }}
                columnStyle={{
                  ...getStyle(model?.columnStyle, formData),
                }}
                addNewRecordsProps={
                  model.allowNewRecord
                    ? {
                        modalFormId: model.modalFormIdd,
                        modalTitle: model.modalTitle,
                        showModalFooter: model.showModalFooter,
                        modalWidth: customWidth ? `${customWidth}${widthUnits}` : modalWidth,
                        buttons: model?.buttons,
                        footerButtons: model?.footerButtons,
                      }
                    : undefined
                }
                incomeValueFunc={incomeValueFunc}
                outcomeValueFunc={outcomeValueFunc}
                name={model?.componentName}
                value={value}
                onChange={onChangeInternal}
                size={model.size}
              />
            );
          }}
        </ConfigurableFormItem>
      </div>
    );
  },
  initModel: (model) => ({
    ...model,
    hideLabel: true,
  }),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default KanbanComponent;
