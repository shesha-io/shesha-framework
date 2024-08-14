import { useDeepCompareMemo } from '@/hooks';
import React, { FC, MutableRefObject } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useForm, useSheshaApplication } from '@/providers';
import { CustomErrorBoundary } from '..';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useShaFormInstance } from '@/providers/form/newProvider/shaFormProvider';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  const formInstance = useForm();
  const allData = useAvailableConstantsData();
  const { form, isComponentFiltered } = formInstance;
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const parent = useParent(false);

  const closestShaForm = useShaFormInstance(false);
  /*
  const { data, form: formApi } = allData;
  console.log('LOG: allData', {
    data,
    formApi
  });
  */

  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    const { data, form: formApi } = allData;
    if (componentModel.propertyName === 'dataLoaderType'){
      console.log('LOG: actualModel', {
        id: componentModel.id,
        propertyName: componentModel.propertyName,
        type: componentModel.type,
        data,
        formApi,
        lastUpdate: allData.contexts.lastUpdate,
        closestShaForm: closestShaForm
      });
    }

    const result = getActualModelWithParent(
      { ...componentModel, editMode: typeof componentModel.editMode === 'undefined' ? undefined : componentModel.editMode }, // add editMode property if not exists
      allData, parent
    );

    return result;
  }, [componentModel, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  const toolboxComponent = getToolboxComponent(componentModel.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  actualModel.hidden = allData.form?.formMode !== 'designer' 
    && (
      actualModel.hidden
        || !anyOfPermissionsGranted(actualModel?.permissions || [])
        || !isComponentFiltered(componentModel)); // check `model` without modification
  actualModel.readOnly = actualModel.readOnly;

  // binding only input and output components
  if (!toolboxComponent.isInput && !toolboxComponent.isOutput) 
    actualModel.propertyName = undefined;

  return (
    <CustomErrorBoundary>
      <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormComponent);
export default FormComponentMemo;