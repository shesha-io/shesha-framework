import { ComponentsContainer } from "components";
import { FormRawMarkup, IFormSettings } from "providers";
import { CrudProvider } from "providers/crudContext/index";
import { CrudMode } from "providers/crudContext/models";
import { ComponentsContainerProvider } from "providers/form/nesting/containerContext";
import { FormMarkupConverter } from "providers/formMarkupConverter/index";
import React, { CSSProperties, FC } from "react";
import { ItemContainerForm } from "./itemContainerForm";

export interface IDataListItemProps {
  listId: string;
  listName?: string;
  itemIndex: number;
  itemId?: any;
  style?: CSSProperties;
  editMode: CrudMode;
  data?: any;
  markup: FormRawMarkup;
  formSettings: IFormSettings;
}

export const DataListItemRenderer: FC<IDataListItemProps> = (props) => {

  const {
    listId,
    itemIndex,
    itemId,
    data,
    editMode,
    markup,
    formSettings
  } = props;

  const itemListId = `${listId}_${!!itemId ? itemId.toString() : itemIndex}`;
  //const itemListName = `${listName}.${itemIndex}`;
  //..const ctxId = `ctx_${itemListId}`;

  

  return (
    <FormMarkupConverter markup={markup} formSettings={formSettings}>
      {(flatComponents) => (
        <CrudProvider
          isNewObject={false}
          data={data}
          allowEdit={true}
          updater={undefined}
          allowDelete={true}
          deleter={undefined}
          mode={editMode}
          allowChangeMode={true}
          autoSave={false}
          editorComponents={flatComponents}
          displayComponents={flatComponents}
          formSettings={formSettings}
        >
          <div key={itemListId}>
            <ComponentsContainerProvider ContainerComponent={ItemContainerForm}>
              <ComponentsContainer containerId={'root'} readOnly={editMode === 'read'}/>
            </ComponentsContainerProvider>
          </div>
        </CrudProvider>
      )}
    </FormMarkupConverter>
  );

  /*return (
    <DataContextProvider id={ctxId} name={listName} description={`DataList context for ${listName} item ${itemIndex}`} type='dataList'>
      <SubFormProvider {...props} context={ctxId} actionsOwnerId={itemListId} actionOwnerName={itemListName} key={itemListId}>
        <SubForm style={style} readOnly={readOnly} />
      </SubFormProvider>
    </DataContextProvider>
  );*/
};