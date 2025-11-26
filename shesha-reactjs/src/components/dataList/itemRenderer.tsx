import { ComponentsContainer } from "@/components";
import { FormRawMarkup, IFormSettings } from "@/interfaces";
import { FormItemProvider } from "@/providers";
import { DataListCrudProvider } from "@/providers/dataListCrudContext/index";
import { CrudMode } from "@/providers/crudContext/models";
import { ComponentsContainerProvider } from "@/providers/form/nesting/containerContext";
import { FormMarkupConverter } from "@/providers/formMarkupConverter/index";
import React, { FC, Component, ErrorInfo, ReactNode } from "react";
import CrudActionButtons from "./crudActionButtons";
import { ItemContainerForm } from "./itemContainerForm";
import { useStyles } from './styles/styles';
import { ConfigurationLoadingError } from '@/providers/configurationItemsLoader/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class DataListItemErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    if (error instanceof ConfigurationLoadingError) {
      console.error('Configuration loading error in DataList item:', error.message);
    } else {
      console.error('Error rendering DataList item:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Return fallback or null to show placeholder
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

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
    <DataListItemErrorBoundary>
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
    </DataListItemErrorBoundary>
  );
};
