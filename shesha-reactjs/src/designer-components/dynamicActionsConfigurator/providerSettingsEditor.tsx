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
      headerStyles={{
        background: { type: "color", color: "#fff" },
        border: {
          borderType: "custom",
          border: { bottom: { color: "var(--primary-color)", width: "2px", style: "solid" } },
          radiusType: "custom",
          radius: { topLeft: "0px", topRight: "0px" },
        },
        font: { color: "darkslategray", type: "Segoe UI", size: 14, weight: "500" },
      }}
      border={{ borderType: "all", border: { all: { width: "0px", style: "none" } } }}
      stylingBoxJson={{ _type: "styleBox", marginBottom: "5px" }}
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
