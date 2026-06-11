import React from 'react';
import { FunctionOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import {
  ExpressionEditor,
  ExpressionContext,
  buildExpressionContextFromPaths,
} from '@/components/expressionEditor';
import {
  ExpressionContextTree,
  buildExpressionContextFromMetadata,
  mergeExpressionContexts,
} from '@/components/expressionEditor/contextMetadata';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { useMetadata } from '@/providers/metadata';
import { asPropertiesArray } from '@/interfaces/metadata';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useForm } from '@/providers';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';
import { ExpressionEditorComponentDefinition, IExpressionEditorComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

const EMPTY_CONTEXT: ExpressionContext = {};

const ExpressionEditorComponent: ExpressionEditorComponentDefinition = {
  type: 'expressionEditor',
  name: 'Expression Editor',
  icon: <FunctionOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.string,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const formDesigner = useFormDesignerOrUndefined();
    const isDesignMode = formMode === 'designer';

    const availableConstants = useAvailableConstantsMetadata({
      standardConstants: [
        SheshaConstants.globalState,
        SheshaConstants.pageContext,
        SheshaConstants.contexts,
      ],
    });
    const formMetadata = useMetadata(false)?.metadata;

    const dataPathContext = React.useMemo(() => {
      const properties = asPropertiesArray(formMetadata?.properties, []);
      const paths = properties.map((property) => property.path).filter(Boolean);
      return buildExpressionContextFromPaths(paths);
    }, [formMetadata]);

    const constantsContext = useAsyncMemo<ExpressionContextTree>(
      () => buildExpressionContextFromMetadata(availableConstants),
      [availableConstants],
      {},
    );

    const context = React.useMemo(
      () => mergeExpressionContexts(
        dataPathContext,
        constantsContext ?? {},
      ),
      [dataPathContext, constantsContext],
    );

    if (isDesignMode) {
      const onDesignerChange = (value: string): void => {
        formDesigner?.updateComponent({
          componentId: model.id,
          updater: (prev) => ({ ...prev, value } as IExpressionEditorComponentProps),
        });
      };

      return (
        <ConfigurableFormItem model={model}>
          {() => (
            <ExpressionEditor
              value={typeof model.value === 'string' ? model.value : ''}
              onChange={onDesignerChange}
              disabled={model.readOnly}
              context={context ?? EMPTY_CONTEXT}
              placeholder={model.placeholder}
            />
          )}
        </ConfigurableFormItem>
      );
    }

    return (
      <ConfigurableFormItem model={model} initialValue={model.value}>
        {(value, onChange) => (
          <ExpressionEditor
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            disabled={model.readOnly}
            context={context ?? EMPTY_CONTEXT}
            placeholder={model.placeholder}
            inline
            allowExpand
          />
        )}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => ({
    ...model,
    label: 'Expression Editor',
  }),
  migrator: (m) => m
    .add<IExpressionEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IExpressionEditorComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IExpressionEditorComponentProps>(2, (prev) => migrateReadOnly(prev)),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default ExpressionEditorComponent;
