import React, { FC, PropsWithChildren, useMemo, useState } from 'react';
import { ShaForm } from '@/providers/form';
import { Button, Tooltip, Popover } from 'antd';
import { useFormDesigner, useFormDesignerSelectedComponentId, useFormDesignerIsDebug } from '@/providers/formDesigner';
import { DeleteFilled, FunctionOutlined, InfoCircleFilled } from '@ant-design/icons';
import { useStyles } from '../styles/styles';
import { IModelValidation } from '@/utils/errors';
import componentDocs from '@/components/componentErrors/component-docs.json';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { isValidGuid } from '@/index';

interface IDragWrapperProps {
  componentId: string;
  readOnly?: boolean;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const { styles } = useStyles();

  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isDebug = useFormDesignerIsDebug();
  const { setSelectedComponent, deleteComponent } = useFormDesigner();
  const [isOpen, setIsOpen] = useState(false);

  const componentModel = ShaForm.useComponentModel(props.componentId);
  const getToolboxComponent = useFormDesignerComponentGetter();

  // Compute validation for this component
  const validationResult = useMemo<IModelValidation | undefined>(() => {
    if (!componentModel?.id || !isValidGuid(componentModel.id)) return undefined;

    const toolboxComponent = getToolboxComponent(componentModel.type);
    if (!toolboxComponent?.validateModel) return undefined;

    const actualModel = {
      ...componentModel,
      id: componentModel.id || props.componentId,
    };

    const errors: Array<{ propertyName?: string; error: string }> = [];
    toolboxComponent.validateModel(actualModel, (propertyName, error) => {
      errors.push({ propertyName, error });
    });

    return errors.length > 0 ? {
      hasErrors: true,
      componentId: componentModel.id,
      componentName: componentModel.componentName,
      componentType: componentModel.type,
      errors,
    } : undefined;
  }, [componentModel, props.componentId, getToolboxComponent]);

  const tooltip = useMemo(() => (
    <div>
      {isDebug && (
        <div>
          <strong>Id:</strong> {componentModel.id}
        </div>
      )}
      <div>
        <strong>Type:</strong> {componentModel.type}
      </div>
      {Boolean(componentModel.propertyName) && (
        <div>
          <strong>Property name: </strong>
          {typeof (componentModel.propertyName) === 'string' ? componentModel.propertyName : ''}
          {typeof (componentModel.propertyName) === 'object' && <FunctionOutlined />}
        </div>
      )}
      {Boolean(componentModel.componentName) && (
        <div><strong>Component name: </strong>{componentModel.componentName}</div>
      )}
    </div>
  ), [componentModel]);

  const onClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();

    if (selectedComponentId !== props.componentId)
      setSelectedComponent(
        props.componentId,
      );
  };

  const onMouseOver = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setIsOpen(true);
  };

  const onMouseOut = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setIsOpen(false);
  };
  const onDeleteClick = (): void => {
    deleteComponent({ componentId: componentModel.id });
  };

  const hasErrors = validationResult?.hasErrors;
  const effectiveType = validationResult?.validationType ?? 'warning';

  const componentType = validationResult?.componentType;
  const docUrl = componentType && componentType in componentDocs
    ? componentDocs[componentType as keyof typeof componentDocs]
    : undefined;

  const getPopoverContent = (): React.ReactElement | null => {
    if (!hasErrors || !validationResult.errors?.length) return null;

    return (
      <>
        {validationResult.errors.map((error, index) => {
          const errorParts = error.error?.split('\n') || [];
          return (
            <p key={index} style={{ margin: 0, marginBottom: index < validationResult.errors.length - 1 ? '4px' : 0 }}>
              {error.propertyName && <strong>{error.propertyName}: </strong>}
              {errorParts.map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {partIndex > 0 && <br />}
                  {part}
                </React.Fragment>
              ))}
            </p>
          );
        })}
        {docUrl && (
          <>
            <br />
            <a href={docUrl} target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
          </>
        )}
      </>
    );
  };

  const popoverTitle = effectiveType === 'info' ? 'Hint:' : `'${validationResult?.componentType}' has configuration issue(s)`;

  return (
    <div className={styles.componentDragHandle} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {!props?.readOnly && isOpen && (
        <div className={styles.shaComponentControls}>
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      )}

      {/* Error icon - always visible if there are errors */}
      {hasErrors && (
        <div className={styles.shaComponentValidationIcon}>
          <Popover
            content={getPopoverContent()}
            title={popoverTitle}
            trigger={["hover", "click"]}
            placement="leftTop"
            color="rgb(214, 214, 214)"
          >
            <InfoCircleFilled style={{ color: '#faad14', fontSize: '16px', cursor: 'help' }} />
          </Popover>
        </div>
      )}

      <Tooltip title={tooltip} placement="right" open={isOpen}>
        {props.children}
      </Tooltip>
    </div>
  );
};

export default DragWrapper;
