import { evaluateDynamicFilters } from '@/utils/datatable';
import { getTableDefaults } from '@/designer-components/dataTable/table/utils';
import React, { useEffect, useState } from 'react';
import { useStyles } from './styles/styles';
import { useMedia } from 'react-use';
import { Alert, Button, Modal } from 'antd';
import { IEntityPickerProps, IEntityPickerState } from './models';
import { nanoid } from '@/utils/uuid';
import { IModalProps } from '@/providers/dynamicModal/models';
import { isEmpty } from 'lodash';
import { hasDynamicFilter } from '@/providers/dataTable/utils';
import { SheshaError } from '@/utils/errors';
import { useShaFormDataUpdate, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { useDataTableStore } from '@/providers/dataTable/hooks';
import { useGlobalState } from '@/providers/globalState';
import { useDataContextManagerActionsOrUndefined } from '@/providers/dataContextManager/hooks';
import { useModal } from '@/providers/dynamicModal';
import { useNestedPropertyMetadatAccessor } from '@/providers/metadataDispatcher';
import GlobalTableFilter from '../globalTableFilter';
import TablePager from '../tablePager';
import { DataTable } from '../dataTable';
import DataTableProvider from '@/providers/dataTable';
import { ITableRowData } from '@/providers/dataTable/interfaces';
import { isDefined } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { IEntityReferenceDto } from '@/interfaces';

const UNIQUE_ID = 'HjHi0UVD27o8Ub8zfz6dH';

export interface IEntityPickerModalProps extends IEntityPickerProps {
  onCloseModal: () => void;
};

const EntityPickerModalInternal = (props: IEntityPickerModalProps): React.JSX.Element => {
  const {
    entityType,
    filters,
    onChange,
    value,
    mode,
    size,
    onSelect,
    title = 'Select Item',
    addNewRecordsProps,
    configurableColumns = [],
    width,
    outcomeValueFunc,
    incomeValueFunc,
    onCloseModal,
  } = props;

  const { styles } = useStyles({});
  const [modalId] = useState(nanoid()); // use generated value because formId was changed. to be reviewed
  const [state, setState] = useState<IEntityPickerState>({ showModal: true });
  const hidePickerDialog = (): void => {
    setState((prev) => ({ ...prev, showModal: false }));
    onCloseModal();
  };

  const isSmall = useMedia('(max-width: 480px)');

  const {
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    registerConfigurableColumns,
    setPredefinedFilters,
  } = useDataTableStore();

  // ToDo: AS - need to optimize
  useShaFormDataUpdate();

  const { globalState } = useGlobalState();
  const { formData } = useShaFormInstance();
  const pageContext = useDataContextManagerActionsOrUndefined()?.getPageContext();

  useEffect(() => {
    registerConfigurableColumns(modalId, configurableColumns);
  }, [configurableColumns, modalId, registerConfigurableColumns]);

  const valueId = Array.isArray(value)
    ? value.map((x) => incomeValueFunc(x, {}))
    : incomeValueFunc(value, {});

  const isMultiple = mode === 'multiple';

  const onDblClick = (row: ITableRowData): void => {
    if (onSelect) {
      onSelect(row);
    } else {
      if (isMultiple) {
        const values = !!valueId ? (Array.isArray(valueId) ? valueId : [valueId]) : [];
        if (!values.includes(row.id)) {
          const vs = isDefined(value)
            ? (Array.isArray(value) ? value : [value])
            : [];
          const outcome = outcomeValueFunc(row, {});
          const newValue = [...vs, outcome].filter(isDefined);
          onChange?.(newValue as string[] | IEntityReferenceDto[], null);
        }
      } else {
        onChange?.(outcomeValueFunc(row, {}) ?? null, null);
      }
    }

    hidePickerDialog();
  };

  const modalProps: IModalProps<ITableRowData> | undefined = isDefined(addNewRecordsProps) && isDefined(addNewRecordsProps.modalFormId)
    ? {
      id: modalId,
      isVisible: false,
      formId: addNewRecordsProps.modalFormId,
      title: addNewRecordsProps.modalTitle,
      showModalFooter: false, // doing this allows the modal to depend solely on the footerButtons prop
      width: addNewRecordsProps.modalWidth,
      buttons: addNewRecordsProps.buttons,
      footerButtons: addNewRecordsProps.footerButtons,
      onSubmitted: (localValue) => {
        if (localValue)
          onDblClick(localValue);
      },
    } satisfies IModalProps<ITableRowData>
    : undefined;

  const dynamicModal = useModal(modalProps);

  const hasFilters = isDefined(filters) && filters.length > 0;

  const foundDynamicFilter = isDefined(filters) && hasDynamicFilter(filters);

  const hasFormData = !isEmpty(formData);
  const hasGlobalState = !isEmpty(formData);
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);

  const evaluateDynamicFiltersHelper = (): void => {
    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: formData },
        { match: 'globalState', data: globalState },
        { match: 'pageContext', data: { ...pageContext?.getFull() } },
      ],
      propertyMetadataAccessor,
    ).then((evaluatedFilters) => {
      let parsedFilters = evaluatedFilters;

      if (isNonEmptyArray(evaluatedFilters)) {
        evaluatedFilters[0] = {
          ...evaluatedFilters[0],
          defaultSelected: true,
          selected: true,
        };
      }

      if (hasFormData || hasGlobalState) {
        // Here we know we have evaluated our filters

        // TODO: Deal with the situation whereby the expression value evaluated to empty string because the action GetData will fail
        setPredefinedFilters(parsedFilters);
      } else if (!foundDynamicFilter) {
        // Here we do not need dynamic filters
        setPredefinedFilters(parsedFilters);
      }
    }).catch((error) => {
      console.error('Failed to evaluate dynamic filters', error);
      throw error;
    });
  };

  useEffect(() => {
    if (hasFilters) {
      evaluateDynamicFiltersHelper();
    }
    // TODO V1: review dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, formData, globalState]);

  useEffect(() => {
    if (state.showModal) {
      if (isNonEmptyArray(selectedStoredFilterIds) && selectedStoredFilterIds.includes(UNIQUE_ID)) {
        changeSelectedStoredFilterIds([]);
      }
    }
    // TODO V1: review dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.showModal]);

  if (!entityType) {
    throw SheshaError.throwPropertyError('entityType');
  }

  const onAddNew = (): void => {
    if (addNewRecordsProps && addNewRecordsProps.modalFormId) {
      hidePickerDialog();
      dynamicModal.open();
    } else console.warn('Modal Form is not specified');
  };

  const onModalOk = (): void => {
    if (onSelect && state.selectedRow) {
      onSelect(state.selectedRow);
    }
    hidePickerDialog();
  };

  const handleCancel = (): void => {
    hidePickerDialog();
  };

  const canAddNew = isDefined(addNewRecordsProps) && addNewRecordsProps.modalFormId;

  const footer = (
    <>
      <div>
        {canAddNew && (
          <Button type="primary" onClick={onAddNew} size={size}>
            Add New
          </Button>
        )}
      </div>
      <Button onClick={handleCancel} size={size}>
        Close
      </Button>
    </>
  );

  const modalWidth = isSmall ? '90%' : width;
  return (
    <Modal
      title={title || 'Select Item'}
      className={styles.entityPickerModal}
      open={state.showModal}
      onOk={onModalOk}
      onCancel={handleCancel}
      {...(modalWidth ? { width: modalWidth } : {})}
      okText="Select"
      footer={footer}
    >
      <>
        <Alert title="Double click an item to select" type="info" />
        <GlobalTableFilter
          searchProps={{ size: 'middle', autoFocus: true, placeholder: 'Search by Title, Type or Keyword...' }}
        />
        <div className={styles.entityPickerModalPagerContainer}>
          <TablePager />
        </div>

        <DataTable
          onDblClick={onDblClick}
          options={{ omitClick: true }}
          striped
          rowDividers
          rowAlternateBackgroundColor={getTableDefaults().rowAlternateBackgroundColor}
          headerBackgroundColor="#ffffff"
          headerFontSize={getTableDefaults().headerFontSize}
          headerFontWeight={getTableDefaults().headerFontWeight}
          headerFontFamily={getTableDefaults().headerFontFamily}
        />
      </>
    </Modal>
  );
};

export const EntityPickerModal = (props: IEntityPickerModalProps): React.JSX.Element => {
  return (
    <DataTableProvider
      userConfigId={'table_' + props.name}
      actionOwnerName={'table_' + props.name}
      sourceType="Entity"
      entityType={props.entityType}
      dataFetchingMode="paging"
      sortMode="standard"
    >
      <EntityPickerModalInternal {...props} />
    </DataTableProvider>
  );
};
