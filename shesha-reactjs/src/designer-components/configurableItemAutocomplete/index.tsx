import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IConfigurableItemAutocompleteComponentProps } from './interfaces';
import { useAsyncDeepCompareMemo } from '@/hooks/useAsyncMemo';
import { evaluateDynamicFilters } from '@/utils';
import { useNestedPropertyMetadatAccessor } from '@/providers';
import { ConfigItemAutocomplete } from '@/components/configurableItemAutocomplete';

const settingsForm = settingsFormJson as FormMarkup;

export const ConfigurableItemAutocompleteComponent: IToolboxComponent<IConfigurableItemAutocompleteComponentProps> = {
  type: 'configurableItemAutocomplete',
  name: 'Configurable Item Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {

    const { filter } = model;
    const allData = useAvailableConstantsData();

    const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(model.entityType);
    const evaluatedFilter = useAsyncDeepCompareMemo<object>(async () => {
      if (!filter)
        return undefined;

      const response = await evaluateDynamicFilters(
        [{ expression: filter } as any],
        [
          {
            match: 'data',
            data: allData.data,
          },
          {
            match: 'globalState',
            data: allData.globalState,
          },
          {
            match: 'pageContext',
            data: { ...allData.pageContext },
          },
        ],
        propertyMetadataAccessor
      );

      if (response.find((f) => f?.unevaluatedExpressions?.length))
        return undefined;

      const expression = response.length > 0
        ? response[0]?.expression
        : undefined;
      if (!expression)
        return undefined;
      
      return typeof (expression) === 'string'
        ? JSON.parse(expression)
        : expression;
    }, [filter, allData.data, allData.globalState, allData.pageContext]);

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>
          <ConfigItemAutocomplete
            entityType={model.entityType}
            readOnly={model.readOnly}
            value={value}
            onChange={onChange}
            mode={model.mode}
            filter={evaluatedFilter}
          />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IConfigurableItemAutocompleteComponentProps>(0, (prev) => ({
      ...prev,
      entityType: '',
      mode: 'single'
    })),
};