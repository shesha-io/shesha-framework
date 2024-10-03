import React, { FC, PropsWithChildren } from "react";
import { IModelValidation } from "@/utils/errors";
import { WarningOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import getDefaultErrorPlaceholder from "./defaultErrorPlaceholder";
import { IConfigurableFormComponent, IToolboxComponent, useForm } from "@/index";

export interface IErrorWrapperProps {
  errors?: IModelValidation;
  resetErrorBoundary?: (...args: Array<unknown>) => void;
  toolboxComponent?: IToolboxComponent<IConfigurableFormComponent>;
}
export const ErrorWrapper: FC<PropsWithChildren<IErrorWrapperProps>> = ({
  toolboxComponent,
  errors,
  children,
  resetErrorBoundary
}) => {

  const { formMode } = useForm();

  const errortip = (errors: IModelValidation) => {
    return (
      <div>
        {Boolean(errors.message) && <div>{errors.message}:</div>}
        <div>{errors.errors?.map((error) => {
          return error.type === 'warning' 
          ? <div><WarningOutlined style={{fontSize: '16px', color: 'orange'}}/> {error.error}</div>
          : error.type === 'error'
            ? <div><WarningOutlined style={{fontSize: '16px', color: 'red'}}/> {error.error}</div>
            : <div>{error.error}</div>;
        })}</div>
        {Boolean(resetErrorBoundary) && <Button type="link" onClick={resetErrorBoundary}>Try again</Button>}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '28px', height: '100%', display: 'flex', width: '100%', position: 'relative' }}>
      {Boolean(children) && formMode === 'designer' &&
        <div style={{ display: 'block', width: '100%', padding: '5px', border: '1px solid red', borderRadius: '4px'}}>
          {children}
        </div>
      }
      {Boolean(children) && formMode !== 'designer' &&
        <div style={{ display: 'block', width: '100%'}}>
          {children}
        </div>
      }
      {!children && 
        <div style={{ minHeight: '28px', display: 'block', width: '100%' }}>
          {getDefaultErrorPlaceholder(errors, toolboxComponent)}
        </div>
      }
      <div style={{ display: 'flex', zIndex: 1001, position: 'absolute', top: '3px', right: '3px' }}>
          <Tooltip title={errortip(errors)} placement='topLeft'>
              <Button icon={<WarningOutlined style={{ height: '80%' }} />} size="middle" danger>
              </Button>
          </Tooltip>
      </div>
    </div>
  );

};