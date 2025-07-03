import { ArrowsAltOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React from 'react';
import { useGlobalState, useFormData, useForm } from '@/providers';
import { evaluateString, validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces/formDesigner';
import { getStyle } from '@/providers/form/utils';
import StatusTag, { DEFAULT_STATUS_TAG_MAPPINGS, IStatusTagProps as ITagProps } from '@/components/statusTag';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { migrateCustomFunctions, migrateFunctionToProp, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { jsonSafeParse } from '@/utils/object';

export interface IStatusTagProps extends Omit<ITagProps, 'mappings' | 'style'>, IConfigurableFormComponent {
  mappings?: string;
  valueSource?: 'form' | 'manual';
}

const StatusTagComponent: IToolboxComponent<IStatusTagProps> = {
  type: 'statusTag',
  name: 'Status Tag',
  isInput: false,
  isOutput: true,
  icon: <ArrowsAltOutlined />,
  Factory: ({ model }) => {
    const { globalState } = useGlobalState();
    const { data } = useFormData();
    const { formMode } = useForm();

    const { override, value, color, valueSource } = model;

    const allEmpty = [override, value, color].filter(Boolean)?.length === 0;

    // TODO: AS - review code from Luke and remove
    /** Used to inject table row in the status tag if rendered on databale. Uses data if not applicable **/
    //func(model?.injectedTableRow || data, formMode);
    
    const getValueByExpression = (expression: string = '') => {
      return typeof expression === 'string' 
        ? expression?.includes('{{') ? evaluateString(expression, data) : expression
        : '';
    };

    if (allEmpty && valueSource === 'manual') {
      return formMode === 'designer'
        ? <Alert type="warning" message="Status tag not configured properly" />
        : null;
    }

    const evaluatedOverrideByExpression = getValueByExpression(override);
    const localValueByExpression = getValueByExpression(value?.toString());
    const localColorByExpression = getValueByExpression(color);

    const allEvaluationEmpty =
      [
        evaluatedOverrideByExpression,
        localValueByExpression,
        localColorByExpression
      ].filter(Boolean)?.length === 0;

    const getParsedMappings = () => {
      try {
        return jsonSafeParse(model?.mappings);
      } catch {
        return null;
      }
    };

    const props: ITagProps = {
      override: evaluatedOverrideByExpression,
      value: allEvaluationEmpty ? 1000 : localValueByExpression,
      color: localColorByExpression,
      mappings: getParsedMappings(),
    };

    return (
      <ConfigurableFormItem model={model}>
        {(value) =>
          <StatusTag {...props} style={getStyle(model?.style, data, globalState)} 
            value={model?.valueSource !== 'form' ? props.value : value}
          />
        }
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  migrator: (m) => m
    .add<IStatusTagProps>(0, (prev) => ({
      ...prev,
      valueSource: prev['valueSource'] ?? 'manual',
      value: prev['value'],
      color: prev['color'],
    }))
    .add<IStatusTagProps>(1, (prev) => 
      migratePropertyName(
        migrateCustomFunctions(
          migrateFunctionToProp(
            migrateFunctionToProp(
              migrateFunctionToProp(prev, 'override', 'overrideCodeEvaluator')
            , 'value', 'valueCodeEvaluator')
          , 'color', 'colorCodeEvaluator')
        )))
    .add<IStatusTagProps>(2, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
  initModel: (model) => ({
    mappings: JSON.stringify(DEFAULT_STATUS_TAG_MAPPINGS, null, 2) as any,
    ...model,
  }),
};

export default StatusTagComponent;
