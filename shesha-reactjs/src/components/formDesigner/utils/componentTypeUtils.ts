export interface ComponentTypeInfo {
  isDataTableContext: boolean;
  isFileList: boolean;
  isFileUpload: boolean;
  isInput: boolean;
  isFileComponent: boolean;
}

export const getComponentTypeInfo = (component: any): ComponentTypeInfo => {
  const isDataTableContext = component?.type === 'datatableContext';
  const isFileList = component?.type === 'attachmentsEditor';
  const isFileUpload = component?.type === 'fileUpload';
  const isInput = component?.isInput;
  const isFileComponent = isFileList || isFileUpload;

  return {
    isDataTableContext,
    isFileList,
    isFileUpload,
    isInput,
    isFileComponent,
  };
};