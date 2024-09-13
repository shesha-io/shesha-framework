import React, { FC, MutableRefObject, useEffect, useState } from 'react';
import { IFormLayoutSettings, ISettingsFormFactory, ISettingsFormInstance, IToolboxComponent } from '@/interfaces';
import { useDebouncedCallback } from 'use-debounce';
import { FormMarkup } from '@/providers/form/models';
import GenericSettingsForm from '../genericSettingsForm';
import { IConfigurableFormComponent, useCanvasConfig } from '@/providers';
import { useFormDesignerActions } from '@/providers/formDesigner';

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
  const evaluatedMarkup = typeof markup === 'function'
    ? markup({})
    : markup;
  return ({ readOnly, model, onSave, onCancel, onValuesChange, toolboxComponent, formRef, propertyFilter, layoutSettings }) => {
    return (
      <GenericSettingsForm
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        markup={evaluatedMarkup}
        onValuesChange={onValuesChange}
        toolboxComponent={toolboxComponent}
        formRef={formRef}
        propertyFilter={propertyFilter}
        layoutSettings={layoutSettings}
      />
    );
  };
};

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function isValidStyle(property: string): boolean {
  const kebabProperty = camelToKebab(property);
  return CSS.supports(kebabProperty, '');
}

export const ComponentPropertiesEditor: FC<IComponentPropertiesEditorProps> = (props) => {
  const { componentModel, readOnly, toolboxComponent, autoSave, onSave, propertyFilter, layoutSettings, formRef } = props;

  const { getCachedComponentEditor } = useFormDesignerActions();
  const { activeDevice } = useCanvasConfig();
  const [activeStyles, setActiveStyles] = useState(componentModel);

  const [desktopStyles, setDesktopStyles] = useState({...componentModel, ...componentModel.desktop} || {});
  const [mobileStyles, setMobileStyles] = useState({...componentModel, ...componentModel.mobile} || {});

  const SettingsForm = getCachedComponentEditor(componentModel.type, () => {
    return toolboxComponent.settingsFormFactory
      ? toolboxComponent.settingsFormFactory
      : toolboxComponent.settingsFormMarkup
        ? getDefaultFactory(toolboxComponent.settingsFormMarkup)
        : null;
  });


  const debouncedSave = useDebouncedCallback((values) => {
    const updatedDesktopStyles = { ...desktopStyles };
    const updatedMobileStyles = { ...mobileStyles };

    Object.entries(values).forEach(([key, value]) => {
      if (isValidStyle(key)) {
        if (activeDevice === 'desktop') {
          updatedDesktopStyles[key] = value;
        } else if (activeDevice === 'mobile') {
          updatedMobileStyles[key] = value;
        }
      }
    });

    setDesktopStyles(updatedDesktopStyles);
    setMobileStyles(updatedMobileStyles);

    const combinedStyles = {
      ...values,
      desktop: updatedDesktopStyles,
      mobile: updatedMobileStyles,
    };

    onSave(combinedStyles);
  }, 300);

  const onCancel = () => {
    //not implemented, but required
  };

  const onValuesChange = (_changedValues, values) => {
    if (autoSave && !readOnly) {
      if (activeDevice === 'desktop') {
        const updatedDesktopStyles = { ...desktopStyles, ...values };
        setDesktopStyles(updatedDesktopStyles);
        debouncedSave({ ...values, desktop: updatedDesktopStyles });
      } else if (activeDevice === 'mobile') {
        const updatedMobileStyles = { ...mobileStyles, ...values };
        setMobileStyles(updatedMobileStyles);
        debouncedSave({ ...values, mobile: updatedMobileStyles });
      }
    }
  };

  useEffect(() => {
    if (activeDevice === 'desktop') {
      setActiveStyles({...componentModel, ...mobileStyles, ...desktopStyles, mobile: mobileStyles });
      //onSave({componentModel, ...desktopStyles, mobile: mobileStyles });
      //formRef?.current?.setFieldsValue({ ...desktopStyles, mobile: mobileStyles })
    } else if (activeDevice === 'mobile') {
      setActiveStyles({...componentModel, ...desktopStyles, ...mobileStyles, desktop: desktopStyles});
      //onSave({componentModel, ...mobileStyles, desktop: desktopStyles });
      //formRef?.current?.setFieldsValue({ ...mobileStyles, desktop: desktopStyles })
    }
  }, [activeDevice]);

  return SettingsForm ? (
    <SettingsForm
      formRef={formRef}
      readOnly={readOnly}
      model={activeStyles}
      onSave={onSave}
      onCancel={onCancel}
      onValuesChange={onValuesChange}
      toolboxComponent={toolboxComponent}
      propertyFilter={propertyFilter}
      layoutSettings={layoutSettings}
    />
  ) : null;
};
