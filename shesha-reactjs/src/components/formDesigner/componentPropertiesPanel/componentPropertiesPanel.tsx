import React, { FC, MutableRefObject, useMemo } from 'react';
import { IFormLayoutSettings, ISettingsFormFactory, ISettingsFormInstance, IToolboxComponent } from 'interfaces';
import { Empty } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from 'providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { IConfigurableFormComponent, useMetadataDispatcher } from 'providers';
import { MetadataContext } from 'providers/metadata/contexts';

export interface IComponentPropertiesEditorProps {
  toolboxComponent: IToolboxComponent;
  componentModel: IConfigurableFormComponent;
  onSave: (settings: IConfigurableFormComponent) => Promise<void>;
  readOnly: boolean;
  autoSave: boolean;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
}

const getDefaultFactory = (markup: FormMarkup): ISettingsFormFactory => {
  return ({ readOnly: readonly, model, onSave, onCancel, onValuesChange, toolboxComponent, formRef, propertyFilter, layoutSettings }) => {
    return (
      <GenericSettingsForm
        readonly={readonly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        markup={typeof markup === 'function' ? markup(model) : markup}
        onValuesChange={onValuesChange}
        toolboxComponent={toolboxComponent}
        formRef={formRef}
        propertyFilter={propertyFilter}
        layoutSettings={layoutSettings}
      />
    );
  };
};

export const ComponentPropertiesEditor: FC<IComponentPropertiesEditorProps> = (props) => {
  const { toolboxComponent, componentModel, readOnly, autoSave, formRef, propertyFilter, layoutSettings } = props;

  const { getActiveProvider } = useMetadataDispatcher(false) ?? {};

  const debouncedSave = useDebouncedCallback(
    values => {
      props.onSave(values);
    },
    // delay in ms
    300
  );

  const metaProvider = getActiveProvider ? getActiveProvider() : null;

  const onSave = values => {
    if (!readOnly)
      props.onSave(values);
  };

  const editor = useMemo(() => {

    const emptyEditor = null;

    if (!Boolean(toolboxComponent)) return emptyEditor;

    const settingsFormFactory =
      'settingsFormFactory' in toolboxComponent
        ? toolboxComponent.settingsFormFactory
        : 'settingsFormMarkup' in toolboxComponent
          ? getDefaultFactory(toolboxComponent.settingsFormMarkup)
          : null;
    if (!settingsFormFactory) return emptyEditor;

    const onCancel = () => {
      //
    };

    const onValuesChange = (_changedValues, values) => {
      if (autoSave && !readOnly)
        debouncedSave(values);
    };

    return (
      <MetadataContext.Provider value={metaProvider}>
        <React.Fragment>
          {settingsFormFactory({
            readOnly: readOnly,
            model: componentModel,
            onSave,
            onCancel,
            onValuesChange,
            toolboxComponent,
            formRef: formRef,
            propertyFilter,
            layoutSettings,
          })}
        </React.Fragment>
      </MetadataContext.Provider>
    );
  }, [toolboxComponent, readOnly, metaProvider?.modelType]);

  return Boolean(toolboxComponent)
    ? <>{editor}</>
    : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'
        }
      />
    );
};