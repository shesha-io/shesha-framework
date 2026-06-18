import { useFormBuilderFactory } from '@/form-factory/hooks';
import { FormBuilderFactory } from '@/form-factory/interfaces';
import { IObjectMetadata } from '@/interfaces';
import {
  FormMarkupFactory,
  IConfigurableActionArgumentsFormFactory,
  IConfigurableActionDescriptor,
} from '@/interfaces/configurableAction';
import { getActualActionArguments } from '@/providers/configurableActionsDispatcher';
import { ActionParametersDictionary, FormMarkup } from '@/providers/form/models';
import { Collapse } from 'antd';
import React, { ReactNode, useMemo } from 'react';
import { useStyles } from '../_settings/styles/styles';
import GenericArgumentsEditor from './genericArgumentsEditor';

export interface IActionArgumentsEditorProps<TArguments extends ActionParametersDictionary = ActionParametersDictionary> {
  action: IConfigurableActionDescriptor<TArguments>;
  value?: TArguments;
  onChange?: (value: TArguments) => void;
  readOnly?: boolean;
  availableConstants?: IObjectMetadata;
}

const getDefaultFactory = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(
  fbf: FormBuilderFactory,
  action: IConfigurableActionDescriptor<TArguments>,
  readOnly: boolean,
): IConfigurableActionArgumentsFormFactory<TArguments> => {
  const { argumentsFormMarkup: markup } = action;

  const factory: IConfigurableActionArgumentsFormFactory<TArguments> = ({ model, onSave, onCancel, onValuesChange, availableConstants }) => {
    const markupFactory = typeof markup === 'function'
      ? (markup as FormMarkupFactory)
      : () => markup as FormMarkup;
    const cacheKey = typeof markup !== 'function'
      ? `${action.ownerUid}-${action.name}-args`
      : undefined;

    const formMarkup = markupFactory({ fbf, availableConstants });
    return (
      <GenericArgumentsEditor<TArguments>
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        markup={formMarkup}
        onValuesChange={onValuesChange}
        readOnly={readOnly}
        cacheKey={cacheKey}
      />
    );
  };
  return factory;
};

export const ActionArgumentsEditor = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>({
  action,
  value,
  onChange,
  readOnly = false,
  availableConstants,
}: IActionArgumentsEditorProps<TArguments>): ReactNode => {
  const { styles } = useStyles();
  const fbf = useFormBuilderFactory();

  const argumentsEditor = useMemo(() => {
    const settingsFormFactory = action.argumentsFormFactory
      ? action.argumentsFormFactory
      : action.argumentsFormMarkup
        ? getDefaultFactory<TArguments>(fbf, action, readOnly)
        : null;

    const onCancel = (): void => {
      //
    };

    const onSave = (values: TArguments): void => {
      if (onChange) onChange(values);
    };

    const onValuesChange = (_changedValues: Partial<TArguments>, values: TArguments): void => {
      if (onChange) onChange(values);
    };

    const actualValue = getActualActionArguments(action, value) ?? {} as TArguments;

    return settingsFormFactory
      ? settingsFormFactory({
        model: actualValue,
        onSave,
        onCancel,
        onValuesChange,
        readOnly,
        availableConstants,
      })
      : null;
  }, [action, availableConstants, fbf, onChange, readOnly, value]);

  if (!argumentsEditor) return null;

  return (
    <Collapse
      defaultActiveKey={['1']}
      key={action.name}
      items={[{ key: "1", label: <div className={styles.label}>Arguments</div>, children: argumentsEditor }]}
    />
  );
};
