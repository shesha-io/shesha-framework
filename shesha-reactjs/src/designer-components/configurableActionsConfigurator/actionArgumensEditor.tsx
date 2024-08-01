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

const { Panel } = Collapse;

export interface IActionArgumentsEditorProps {
  action: IConfigurableActionDescriptor;
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  exposedVariables?: ICodeExposedVariable[];
  availableConstants?: IObjectMetadata;
}

const getDefaultFactory = (
  markup: FormMarkup | FormMarkupFactory,
  readOnly: boolean
): IConfigurableActionArgumentsFormFactory => {
  return ({ model, onSave, onCancel, onValuesChange, exposedVariables, availableConstants }) => {
    const markupFactory = typeof markup === 'function' ? (markup as FormMarkupFactory) : () => markup as FormMarkup;

    const formMarkup = markupFactory({ exposedVariables, availableConstants });
    return (
      <GenericArgumentsEditor
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        markup={formMarkup}
        onValuesChange={onValuesChange}
        readOnly={readOnly}
      />
    );
  };
};

export const ActionArgumentsEditor: FC<IActionArgumentsEditorProps> = ({
  action,
  value,
  onChange,
  readOnly = false,
  exposedVariables,
  availableConstants,
}) => {
  const argumentsEditor = useMemo(() => {
    const settingsFormFactory = action.argumentsFormFactory
      ? action.argumentsFormFactory
      : action.argumentsFormMarkup
        ? getDefaultFactory(action.argumentsFormMarkup, readOnly)
        : null;

    const onCancel = () => {
      //
    };

    const onSave = (values) => {
      if (onChange) onChange(values);
    };

    const onValuesChange = (_changedValues, values) => {
      if (onChange) onChange(values);
    };

    return settingsFormFactory
      ? settingsFormFactory({
        model: value,
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
    <Collapse defaultActiveKey={['1']} key={action.name}>
      <Panel header="Arguments" key="1">
        {argumentsEditor}
      </Panel>
    </Collapse>
  );
};

export default ActionArgumentsEditor;
