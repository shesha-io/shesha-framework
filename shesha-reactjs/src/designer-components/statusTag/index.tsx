import { ArrowsAltOutlined } from '@ant-design/icons';
import React from 'react';
import { useGlobalState, useFormData, useForm } from '@/providers';
import { evaluateString, validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces/formDesigner';
import { getStyle } from '@/providers/form/utils';
import StatusTag, { DEFAULT_STATUS_TAG_MAPPINGS, IStatusMappings, IStatusTagProps as ITagProps } from '@/components/statusTag';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { migrateCustomFunctions, migrateFunctionToProp, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { jsonSafeParse } from '@/utils/object';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export interface IStatusTagProps extends Omit<ITagProps, 'mappings' | 'style' | 'readOnly'>, IConfigurableFormComponent {
  mappings?: string | undefined;
  valueSource?: 'form' | 'manual' | undefined;
}

const StatusTagComponent: IToolboxComponent<IStatusTagProps> = {
  type: 'statusTag',
  name: 'Status Tag',
  isInput: false,
  isOutput: true,
  icon: <ArrowsAltOutlined />,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { globalState } = useGlobalState();
    const { data } = useFormData();

    const { override, value, color, valueSource } = model;

    const getValueByExpression = (expression: string = ''): string => {
      return expression.includes('{{') ? evaluateString(expression, data) : expression;
    };

    const evaluatedOverrideByExpression = getValueByExpression(override);
    const localValueByExpression = getValueByExpression(value?.toString());
    const localColorByExpression = getValueByExpression(color);

    const allEvaluationEmpty =
      [
        evaluatedOverrideByExpression,
        localValueByExpression,
        localColorByExpression,
      ].every((item) => isNullOrWhiteSpace(item));

    const getParsedMappings = (): IStatusMappings | undefined => {
      try {
        return !isNullOrWhiteSpace(model.mappings) ? jsonSafeParse(model.mappings) : undefined;
      } catch {
        return undefined;
      }
    };

    const props: ITagProps = {
      override: evaluatedOverrideByExpression,
      value: allEvaluationEmpty ? 1000 : localValueByExpression,
      color: localColorByExpression,
      mappings: getParsedMappings(),
    };

    return (
      <ConfigurableFormItem<string | number> model={model}>
        {(value) => (
          <StatusTag
            {...props}
            style={getStyle(model.style, data, globalState)}
            value={valueSource === 'form' ? value : props.value}
            readOnly={formMode === 'readonly'}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IStatusTagProps>(0, (prev) => {
      const prevTyped = prev as Partial<IStatusTagProps>;
      return {
        ...prev,
        valueSource: prevTyped.valueSource ?? 'manual',
        value: prevTyped.value,
        color: prevTyped.color ?? "",
      } satisfies IStatusTagProps;
    })
    .add<IStatusTagProps>(1, (prev) =>
      migratePropertyName(
        migrateCustomFunctions(
          migrateFunctionToProp(
            migrateFunctionToProp(
              migrateFunctionToProp(prev, 'override', 'overrideCodeEvaluator'),
              'value', 'valueCodeEvaluator'),
            'color', 'colorCodeEvaluator'),
        )))
    .add<IStatusTagProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) })),
  initModel: (model) => ({
    mappings: JSON.stringify(DEFAULT_STATUS_TAG_MAPPINGS, null, 2),
    ...model,
  }),
};

export default StatusTagComponent;
