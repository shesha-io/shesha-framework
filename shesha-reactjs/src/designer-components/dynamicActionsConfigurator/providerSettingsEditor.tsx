import { ReactNode } from 'react';
import {
  FormMarkupFactory,
  IConfigurableActionArgumentsFormFactory,
} from '@/interfaces/configurableAction';
import { FormMarkup } from '@/providers/form/models';
import { GenericSettingsEditor } from './genericSettingsEditor';
import { IObjectMetadata, ISettingsFormFactoryArgs } from '@/interfaces';
import { IDynamicActionsContext } from '@/providers/dynamicActions/contexts';
import { FormBuilderFactory } from '@/form-factory/interfaces';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { isDefined } from '@/utils/nullables';
import { SectionSeparator } from '@/components/sectionSeparator';

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

  return isDefined(settingsFormFactory)
    ? (
      <>
        <div style={{ marginBottom: 16, marginTop: 16 }}><SectionSeparator title="Settings" labelAlign="left" /></div>
        {settingsFormFactory({
          model: value ?? {} as TSettings,
          onSave,
          onCancel,
          onValuesChange,
          readOnly,
          availableConstants,
        })}
      </>
    )
    : null;
};
