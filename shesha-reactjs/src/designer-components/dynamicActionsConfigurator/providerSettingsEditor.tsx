import { Collapse } from 'antd';
import React, { FC, useMemo } from 'react';
import {
  FormMarkupFactory,
  IConfigurableActionArgumentsFormFactory,
} from '@/interfaces/configurableAction';
import { FormMarkup } from '@/providers/form/models';
import { GenericSettingsEditor } from './genericSettingsEditor';
import { IObjectMetadata } from '@/interfaces';
import { IDynamicActionsContext } from '@/providers/dynamicActions/contexts';

const { Panel } = Collapse;

export interface IProviderSettingsEditorProps {
  provider: IDynamicActionsContext;
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  //exposedVariables?: ICodeExposedVariable[];
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
      <GenericSettingsEditor
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

export const ProviderSettingsEditor: FC<IProviderSettingsEditorProps> = ({
  provider,
  value,
  onChange,
  readOnly = false,
  //exposedVariables,
  availableConstants,
}) => {
  const settingsEditor = useMemo(() => {
    const settingsFormFactory = provider.settingsFormFactory
      ? provider.settingsFormFactory
      : provider.settingsFormMarkup
        ? getDefaultFactory(provider.settingsFormMarkup, readOnly)
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
        //exposedVariables,
        availableConstants,
      })
      : null;
  }, [provider]);

  if (!settingsEditor) return null;

  return (
    <Collapse defaultActiveKey={['1']}>
      <Panel header="Settings" key="1">
        {settingsEditor}
      </Panel>
    </Collapse>
  );
};