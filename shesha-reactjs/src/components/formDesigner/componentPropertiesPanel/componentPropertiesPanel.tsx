import React, { FC, MutableRefObject, useEffect, useState, useTransition } from 'react';
import { IFormLayoutSettings, ISettingsFormFactory, ISettingsFormInstance, IToolboxComponent } from '@/interfaces';
import { Empty, Skeleton } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from '@/providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { IConfigurableFormComponent, useMetadataDispatcher } from '@/providers';
import { IMetadataContext, MetadataContext } from '@/providers/metadata/contexts';

export interface IComponentPropertiesEditorProps {
  toolboxComponent: IToolboxComponent;
  componentModel: IConfigurableFormComponent;
  onSave: (settings: IConfigurableFormComponent) => void;
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

interface BuildEditorArgs extends IComponentPropertiesEditorProps {
  metaProvider: IMetadataContext;
  debouncedSave: (values: any) => void;
}
const buildEditor = ({ toolboxComponent, readOnly, metaProvider, componentModel, autoSave, onSave, debouncedSave, formRef, propertyFilter, layoutSettings }: BuildEditorArgs) => {
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
    // not used
  };

  const onValuesChange = (_changedValues, values) => {
    if (autoSave && !readOnly)
      debouncedSave(values);
  };

  return (
    <MetadataContext.Provider value={metaProvider}>
      <React.Fragment>
        <div style={{ margin: '-8px' }}>
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
        </div>
      </React.Fragment>
    </MetadataContext.Provider>
  );
};


export const ComponentPropertiesEditor: FC<IComponentPropertiesEditorProps> = (props) => {
  const { toolboxComponent, componentModel, readOnly } = props;

  const { getActiveProvider } = useMetadataDispatcher(false) ?? {};
  const [editor, setEditor] = useState();
  const [isPending, startTransition] = useTransition();

  const debouncedSave = useDebouncedCallback(
    values => {
      props.onSave(values);
    },
    // delay in ms
    300
  );

  const onSave = values => {
    if (!readOnly)
      props.onSave(values);
  };

  const metaProvider = getActiveProvider ? getActiveProvider() : null;

  // use different ways to update content for changing of component and changing context/readonly
  useEffect(() => {
    startTransition(() => {
      const newEditor = buildEditor({
        ...props,
        metaProvider,
        onSave,
        debouncedSave,
      });
      setEditor(newEditor);
    });
  }, [toolboxComponent, componentModel]);

  useEffect(() => {
    const newEditor = buildEditor({
      ...props,
      metaProvider,
      onSave,
      debouncedSave,
    });
    setEditor(newEditor);
  }, [readOnly, metaProvider?.modelType]);

  return isPending
    ? <Skeleton loading />
    : Boolean(editor)
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