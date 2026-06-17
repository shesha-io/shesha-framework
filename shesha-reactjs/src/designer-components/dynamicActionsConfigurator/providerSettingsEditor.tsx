import React, { ReactNode } from 'react';
import {
  FormMarkupFactory,
  IConfigurableActionArgumentsFormFactory,
} from '@/interfaces/configurableAction';
import { FormMarkup } from '@/providers/form/models';
import { GenericSettingsEditor } from './genericSettingsEditor';
import { IObjectMetadata, ISettingsFormFactoryArgs } from '@/interfaces';
import { IDynamicActionsContext } from '@/providers/dynamicActions/contexts';
import { CollapsiblePanel } from '@/components/panel';
import { FormBuilderFactory } from '@/form-factory/interfaces';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { isDefined } from '@/utils/nullables';
export interface IProviderSettingsEditorProps<TSettings extends object = object> {
  provider: IDynamicActionsContext<TSettings>;
  value?: TSettings;
  onChange?: (value: TSettings) => void;
  readOnly?: boolean | undefined;
  availableConstants?: IObjectMetadata | undefined;
}

const getDefaultFactory = <TModel extends object = object>(
  fbf: FormBuilderFactory,
  markup: FormMarkup | FormMarkupFactory,
  readOnly: boolean,
): IConfigurableActionArgumentsFormFactory<TModel> => {
  const component: {
    ({ model, onSave, onCancel, onValuesChange, availableConstants }: ISettingsFormFactoryArgs<TModel>): ReactNode;
    displayName: string;
  } = ({ model, onSave, onCancel, onValuesChange, availableConstants }) => {
    const markupFactory = typeof markup === 'function' ? (markup as FormMarkupFactory) : () => markup as FormMarkup;

    const formMarkup = markupFactory({ fbf, availableConstants });
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
  component.displayName = `DefaultProviderSettings`;
  return component;
};

export const ProviderSettingsEditor = <TSettings extends object = object>({
  provider,
  value,
  onChange,
  readOnly = false,
  availableConstants,
}: IProviderSettingsEditorProps<TSettings>): ReactNode => {
  const fbf = useFormBuilderFactory();
  if (!isDefined(provider))
    return null;

  const settingsFormFactory = provider.settingsFormFactory
    ? provider.settingsFormFactory
    : provider.settingsFormMarkup
      ? getDefaultFactory<TSettings>(fbf, provider.settingsFormMarkup, readOnly)
      : null;

  const onCancel = (): void => {
    //
  };

  const onSave = (values: TSettings): void => {
    if (onChange) onChange(values);
  };

  const onValuesChange = (_changedValues: Partial<TSettings>, values: TSettings): void => {
    if (onChange) onChange(values);
  };

  return (
    <CollapsiblePanel
      ghost={false}
      headerStyle={{
        backgroundColor: "#fff",
        borderBottomColor: "var(--primary-color)",
        borderBottomStyle: "solid",
        borderBottomWidth: "2px",
        borderTopLeftRadius: "0px",
        borderTopRightRadius: "0px",
        color: "darkslategray",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontWeight: "500",
      }}
      bodyStyle={{
        borderStyle: "none",
        borderWidth: "0px",
        fontWeight: 400,
        marginBottom: "5px",
      }}
      header="Settings"
    >
      {settingsFormFactory && settingsFormFactory({
        model: value ?? {} as TSettings,
        onSave,
        onCancel,
        onValuesChange,
        readOnly,
        availableConstants,
      })}
    </CollapsiblePanel>
  );
};
