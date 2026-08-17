import { useFormComponentStyles } from "@/hooks/formComponentHooks";
import { IConfigurableFormComponent, UnwrapCodeEvaluators, useShaFormInstance } from "@/providers";
import { FC, useMemo } from "react";
import * as React from "react";
import { stylingUtils } from "../utils/stylingUtils";

interface FormComponentPrepareAllStylesProps {
  componentModel: UnwrapCodeEvaluators<IConfigurableFormComponent>;
  children: (componentModel: UnwrapCodeEvaluators<IConfigurableFormComponent>) => React.JSX.Element;
}

/** @deprecated Will be removed after migrate all components to use IStyleValue */
export const FormComponentAllStylesPreparer: FC<FormComponentPrepareAllStylesProps> = ({ componentModel, children }) => {
  const shaForm = useShaFormInstance();

  const allStyles = useFormComponentStyles(componentModel); // ToDo: AS - remove afte migrate all components to use IStyleValue

  const actualModel = useMemo(() => {
    // In designer mode the outer wrapper div owns the margins (via createRootContainerStyle).
    // Strip them from fullStyle/jsStyle here to avoid double-application inside the wrapper.
    // In live mode there is no outer wrapper, so margins stay in fullStyle.
    const isDesignerMode = shaForm.formMode === 'designer';
    const finalAllStyles = isDesignerMode
      ? { ...allStyles, fullStyle: stylingUtils.stripMargins(allStyles.fullStyle), jsStyle: stylingUtils.stripMargins(allStyles.jsStyle) }
      : allStyles;

    return { ...componentModel, allStyles: finalAllStyles };
  }, [allStyles, componentModel, shaForm.formMode]);


  return children(actualModel);
};
