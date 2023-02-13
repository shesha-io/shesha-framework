import { ColProps } from 'antd';
import React, { FC, useContext } from 'react';
import { FormItemActionsContext, FormItemStateContext } from './contexts';

export interface FormItemProviderProps {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  namePrefix?: string;
}

const FormItemProvider: FC<FormItemProviderProps> = ({ children, labelCol, wrapperCol, namePrefix }) => {
  return (
    <FormItemStateContext.Provider
      value={{
        labelCol,
        wrapperCol,
        namePrefix,
      }}
    >
      <FormItemActionsContext.Provider value={null}>{children}</FormItemActionsContext.Provider>
    </FormItemStateContext.Provider>
  );
};

function useFormItem() {
  return useContext(FormItemStateContext);
}

export { FormItemProvider, useFormItem };
