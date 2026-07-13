import { ColProps } from 'antd';
import React, { FC, PropsWithChildren, useContext } from 'react';
import { FormItemStateContext, IFormItemStateContext } from './contexts';

export interface FormItemProviderProps {
  labelCol?: ColProps | undefined;
  wrapperCol?: ColProps | undefined;
  namePrefix?: string | undefined;
}

const FormItemProvider: FC<PropsWithChildren<FormItemProviderProps>> = ({
  children,
  labelCol,
  wrapperCol,
  namePrefix,
}) => {
  return (
    <FormItemStateContext.Provider
      value={{
        labelCol,
        wrapperCol,
        namePrefix,
      }}
    >
      {children}
    </FormItemStateContext.Provider>
  );
};

function useFormItem(): IFormItemStateContext {
  return useContext(FormItemStateContext);
}

export { FormItemProvider, useFormItem };
