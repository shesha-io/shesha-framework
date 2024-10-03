import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import React, { FC } from 'react';
import { useStyles } from './styles/styles';
import { ErrorWrapper } from './errorWrapper';
import { IConfigurableFormComponent, IToolboxComponent } from '@/index';
import getDefaultErrorPlaceholder from './defaultErrorPlaceholder';

export interface IComponentErrorProps {
  errors: IModelValidation;
  resetErrorBoundary?: (...args: Array<unknown>) => void;
  type?: ISheshaErrorTypes;
  errorPlaceholder?: React.ReactNode;
  toolboxComponent?: IToolboxComponent<IConfigurableFormComponent>;
}

const ComponentError: FC<IComponentErrorProps> = ({
  errors,
  resetErrorBoundary,
  errorPlaceholder,
  toolboxComponent,
}) => {

  const { styles } = useStyles();
  
  if (!errors.message)
    errors.message = `'${errors.componentType}' has configuration issue(s)`;
  
  const placeholder = errorPlaceholder ?? toolboxComponent?.errorPlaceholder?.(errors) ?? getDefaultErrorPlaceholder(errors, toolboxComponent);

  return (
    <div className={styles.cmoponentError}>
      <ErrorWrapper errors={errors} resetErrorBoundary={resetErrorBoundary} toolboxComponent={toolboxComponent}>
        {Boolean(placeholder) && placeholder}
      </ErrorWrapper>
    </div>
  );
};

export default ComponentError;