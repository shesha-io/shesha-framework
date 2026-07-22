import { IConfigurableFormComponent, useForm, useShaFormInstance } from "@/providers";
import React, { FC, useEffect, useMemo, useState } from "react";
import { useStyles } from "../styles/styles";
import { useFormDesignerComponentGetter } from "@/providers/form/hooks";
import { toCamelCase } from "@/utils/string";
import { IToolboxComponent } from "@/interfaces/formDesigner";
import { IPropertyMetadata } from "@/interfaces";
import { useDeepCompareMemo } from "@/hooks";
import { ErrorIconPopover } from "@/components/componentErrors/errorIconPopover";
import { IModelValidation } from "@/utils/errors";
import { updateComponentModelFromMetadata } from "@/providers/form/utils";

interface FormComponentPrepareModelProps {
  componentModel: IConfigurableFormComponent;
  children: (componentModel: IConfigurableFormComponent, toolboxComponent: IToolboxComponent) => React.JSX.Element;
}

export const FormComponentModelPreparer: FC<FormComponentPrepareModelProps> = ({ componentModel: sourceComponentModel, children }) => {
  const { styles } = useStyles();
  const shaForm = useShaFormInstance();
  const { modelMetadata } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const [propMetadata, setPropMetadata] = useState<IPropertyMetadata | undefined>(undefined);
  // Memoize component lookup to prevent unnecessary re-renders
  const component = useMemo(() => getToolboxComponent(sourceComponentModel.type), [getToolboxComponent, sourceComponentModel.type]);

  useEffect(() => {
    let cancelled = false;
    if (modelMetadata?.properties && Boolean(sourceComponentModel.propertyName)) {
      const pName = toCamelCase(sourceComponentModel.propertyName ?? '');
      if (Array.isArray(modelMetadata.properties)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPropMetadata(modelMetadata.properties.find((p) => toCamelCase(p.path) === pName));
      } else {
        modelMetadata.properties().then((propsMeta) => {
          if (!cancelled) setPropMetadata(propsMeta.find((p) => toCamelCase(p.path) === pName));
        }).catch((error) => {
          if (!cancelled) console.error('Failed to fetch property metadata:', error);
        });
      }
    }
    return () => {
      cancelled = true;
    };
  }, [modelMetadata, sourceComponentModel.propertyName]);

  const componentModel = useDeepCompareMemo(() => {
    return component && propMetadata
      ? updateComponentModelFromMetadata(component, sourceComponentModel, propMetadata)
      : sourceComponentModel;
  }, [sourceComponentModel, component, propMetadata]);

  // Check for validation errors (in both designer and runtime modes) when the toolbox component does not exist
  if (!component) {
    const componentNotFoundError: IModelValidation = {
      hasErrors: true,
      componentId: componentModel.id,
      componentName: componentModel.componentName,
      componentType: componentModel.type,
      errors: [{ error: `Component '${componentModel.type}' not found` }],
    };
    // Component not found - return early with just error message
    const unregisteredMessage = <div className={styles.unregisteredComponentMessage}>Component &apos;{componentModel.type}&apos; not registered</div>;

    return (
      <div className={styles.unregisteredComponentContainer}>
        {shaForm.formMode !== 'designer' ? (
          <ErrorIconPopover
            mode="validation"
            validationResult={componentNotFoundError}
            type="error"
            isDesignerMode={false}
          >
            {unregisteredMessage}
          </ErrorIconPopover>
        ) : unregisteredMessage}
      </div>
    );
  }

  return children(componentModel, component);
};
