import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useForm } from '../../../providers/form';
import { ISettingsFormFactory } from '../../../interfaces';
import { Empty } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from '../../../providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { useMetadataDispatcher } from '../../../providers';
import { MetadataContext } from '../../../providers/metadata/contexts';
import { useFormDesigner } from '../../../providers/formDesigner';

export interface IProps {}

const getDefaultFactory = (markup: FormMarkup): ISettingsFormFactory => {
  return ({ readOnly: readonly, model, onSave, onCancel, onValuesChange, toolboxComponent }) => {
    return (
      <GenericSettingsForm
        readonly={readonly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        markup={typeof markup === 'function' ? markup(model) : markup}
        onValuesChange={onValuesChange}
        toolboxComponent={toolboxComponent}
      />
    );
  };
};

export const ComponentPropertiesPanel: FC<IProps> = () => {
  const { getToolboxComponent } = useForm();
  const { getComponentModel, updateComponent, selectedComponentId: id, readOnly } = useFormDesigner();
  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const [editor, setEditor] = useState<ReactNode>(<></>);

  const { getActiveProvider } = useMetadataDispatcher(false) ?? {};

  const debouncedSave = useDebouncedCallback(
    values => {
      updateComponent({ componentId: id, settings: { ...values, id } });
    },
    // delay in ms
    300
  );

  const onCancel = () => {
    //
  };

  const onSave = values => {
    if (!readOnly) updateComponent({ componentId: id, settings: { ...values, id } });
  };

  const onValuesChange = (_changedValues, values) => {
    if (!readOnly) debouncedSave(values);
  };

  const wrapEditor = (renderEditor: () => ReactNode) => {
    const metaProvider = getActiveProvider ? getActiveProvider() : null;
    if (!metaProvider) return <>{renderEditor()}</>;

    return (
      <MetadataContext.Provider value={metaProvider}>
        <>{renderEditor()}</>
      </MetadataContext.Provider>
    );
  };

  const getEditor = () => {
    const emptyEditor = null;
    if (!id) return emptyEditor;

    const componentModel = getComponentModel(id);
    const toolboxComponent = getToolboxComponent(componentModel.type);
    if (!Boolean(toolboxComponent)) return emptyEditor;

    const settingsFormFactory =
      'settingsFormFactory' in toolboxComponent
        ? toolboxComponent.settingsFormFactory
        : 'settingsFormMarkup' in toolboxComponent
        ? getDefaultFactory(toolboxComponent.settingsFormMarkup)
        : null;
    if (!settingsFormFactory) return emptyEditor;

    return wrapEditor(() => (
      <React.Fragment key={id}>
        {settingsFormFactory({
          readOnly: readOnly,
          model: componentModel,
          onSave,
          onCancel,
          onValuesChange,
          toolboxComponent,
        })}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    const currentEditor = getEditor();
    setEditor(currentEditor);
  }, [id, readOnly]);

  if (!Boolean(id))
    return (
      <>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'
          }
        />
      </>
    );

  return <>{editor}</>;
};

export default ComponentPropertiesPanel;
