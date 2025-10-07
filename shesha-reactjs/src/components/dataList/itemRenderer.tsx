import { ComponentsContainer } from "@/components";
import { FormRawMarkup, IFormSettings } from "@/interfaces";
import { FormItemProvider } from "@/providers";
import { DataListCrudProvider } from "@/providers/dataListCrudContext/index";
import { CrudMode } from "@/providers/crudContext/models";
import { ComponentsContainerProvider } from "@/providers/form/nesting/containerContext";
import { FormMarkupConverter } from "@/providers/formMarkupConverter/index";
import React, { FC } from "react";
import CrudActionButtons from "./crudActionButtons";
import { ItemContainerForm } from "./itemContainerForm";
import { useStyles } from './styles/styles';


export interface IDataListItemProps {
  listId: string;
  listName?: string;
  itemIndex: number;
  itemId?: any;

  allowEdit: boolean;
  updater?: (data: any) => Promise<any>;
  allowDelete: boolean;
  deleter?: () => Promise<any>;
  editMode: CrudMode;
  data?: any;
  markup: FormRawMarkup;
  formSettings: IFormSettings;
  allowChangeEditMode: boolean;
  autoSave?: boolean;

  isNewObject: boolean;
}

export const DataListItemRenderer: FC<IDataListItemProps> = (props) => {
  const {
    listId,
    itemIndex,
    itemId,
    data,

    allowEdit,
    updater,
    allowDelete,
    deleter,
    editMode,
    markup,
    formSettings,
    allowChangeEditMode,
    autoSave,
    isNewObject,
  } = props;
  const { styles } = useStyles();
  const itemListId = `${listId}_${!!itemId ? itemId.toString() : itemIndex}`;

  return (
    <div key={itemListId}>

      <FormMarkupConverter markup={markup} formSettings={formSettings}>
        {(flatComponents) => {
          return (
            <DataListCrudProvider
              isNewObject={isNewObject}
              data={data}
              allowEdit={allowEdit}
              updater={updater}
              allowDelete={allowDelete}
              deleter={deleter}
              mode={editMode}
              allowChangeMode={allowChangeEditMode}
              autoSave={autoSave}
              formFlatMarkup={flatComponents}
              formSettings={formSettings}
            >
              <div className={styles.shaDatalistCell}>

                <ComponentsContainerProvider ContainerComponent={ItemContainerForm}>
                  {/* add FormItemProvider to reset namePrefix and other SubForm settings if DataList uses inside SubForm*/}
                  <FormItemProvider namePrefix="" labelCol={formSettings?.labelCol} wrapperCol={formSettings?.wrapperCol}>
                    <ComponentsContainer containerId="root" />
                  </FormItemProvider>
                </ComponentsContainerProvider>
                <div className={styles.shaDatalistActions}>
                  <CrudActionButtons />
                </div>
              </div>
            </DataListCrudProvider>
          );
        }}
      </FormMarkupConverter>
    </div>
  );
};
