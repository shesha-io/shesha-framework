import { Collapse } from 'antd';
import React, { FC, useMemo } from 'react';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import {
  FormMarkupFactory,
  IConfigurableActionArgumentsFormFactory,
  IConfigurableActionDescriptor,
} from '@/interfaces/configurableAction';
import { FormMarkup } from '@/providers/form/models';
import GenericArgumentsEditor from './genericArgumentsEditor';
import { IObjectMetadata } from '@/interfaces';
import { getActualActionArguments } from '@/providers/configurableActionsDispatcher';
import { useStyles } from '../_settings/styles/styles';
import { wrapDisplayName } from '@/utils/react';

export interface IActionArgumentsEditorProps {
  action: IConfigurableActionDescriptor;
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  exposedVariables?: ICodeExposedVariable[];
  availableConstants?: IObjectMetadata;
}

const getDefaultFactory = (
  action: IConfigurableActionDescriptor,
  readOnly: boolean,
): IConfigurableActionArgumentsFormFactory => {
  const { argumentsFormMarkup: markup } = action;
  return wrapDisplayName(({ model, onSave, onCancel, onValuesChange, exposedVariables, availableConstants }) => {
    const markupFactory = typeof markup === 'function'
      ? (markup as FormMarkupFactory)
      : () => markup as FormMarkup;
    const cacheKey = typeof markup !== 'function'
      ? `${action.ownerUid}-${action.name}-args`
      : undefined;

    const formMarkup = markupFactory({ exposedVariables, availableConstants });
    return (
      <GenericArgumentsEditor
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        markup={formMarkup}
        onValuesChange={onValuesChange}
        readOnly={readOnly}
        cacheKey={cacheKey}
      />
    );
  }, "defaultArguments");
};

export const ActionArgumentsEditor: FC<IActionArgumentsEditorProps> = ({
  action,
  value,
  onChange,
  readOnly = false,
  exposedVariables,
  availableConstants,
}) => {
  const { styles } = useStyles();

  const argumentsEditor = useMemo(() => {
    const settingsFormFactory = action.argumentsFormFactory
      ? action.argumentsFormFactory
      : action.argumentsFormMarkup
        ? getDefaultFactory(action, readOnly)
        : null;

    const onCancel = (): void => {
      //
    };

    const onSave = (values): void => {
      if (onChange) onChange(values);
    };

    const onValuesChange = (_changedValues, values): void => {
      if (onChange) onChange(values);
    };

    const actualValue = getActualActionArguments(action, value);

    return settingsFormFactory
      ? settingsFormFactory({
        model: actualValue,
        onSave,
        onCancel,
        onValuesChange,
        readOnly,
        exposedVariables,
        availableConstants,
      })
      : null;
  }, [action]);

  if (!argumentsEditor) return null;

  return (
    <Collapse
      defaultActiveKey={['1']}
      key={action.name}
      items={[{ key: "1", label: <div className={styles.label}>Arguments</div>, children: argumentsEditor }]}
    />
  );
};
