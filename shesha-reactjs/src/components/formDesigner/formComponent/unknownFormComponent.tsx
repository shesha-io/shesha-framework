import { FC } from "react";
import ErrorIconPopover from "../../componentErrors/errorIconPopover";
import { useStyles } from '../styles/styles';
import { IModelValidation } from "@/utils/errors";
import React from "react";
import { IConfigurableFormComponent, useShaFormInstance } from "@/providers";

export interface UnknownFormComponentProps {
  componentModel: IConfigurableFormComponent;
}

export const UnknownFormComponent: FC<UnknownFormComponentProps> = ({ componentModel }) => {
  const { styles } = useStyles();
  const shaForm = useShaFormInstance();
  const componentNotFoundError: IModelValidation = {
    hasErrors: true,
    componentId: componentModel.id,
    componentName: componentModel.componentName,
    componentType: componentModel.type,
    errors: [{ error: `Component '${componentModel.type}' not found` }],
  };

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
};
