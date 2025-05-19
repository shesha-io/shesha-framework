import { DataTable, DataTableProvider, GlobalTableFilter, IAnyObject, TablePager, evaluateDynamicFilters, useDataContextManagerActions, useDataTable, useForm, useGlobalState, useModal, useNestedPropertyMetadatAccessor } from '@/index';
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

const UNIQUE_ID = 'HjHi0UVD27o8Ub8zfz6dH';

export interface IEntityPickerModalProps extends IEntityPickerProps {
  onCloseModal: () => void;
};

const EntityPickerModalInternal = (props: IEntityPickerModalProps) => {

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
    configurableColumns,
    width,
    outcomeValueFunc,
    incomeValueFunc,
    onCloseModal,
  } = props;

  const { styles } = useStyles({});
  const [modalId] = useState(nanoid()); // use generated value because formId was changed. to be reviewed
  const [state, setState] = useState<IEntityPickerState>({ showModal: true });
  const hidePickerDialog = () => {
    setState(prev => ({ ...prev, showModal: false }));
    onCloseModal();
  };

  const isSmall = useMedia('(max-width: 480px)');

  const {
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    registerConfigurableColumns,
    setPredefinedFilters,
  } = useDataTable();

  const { globalState } = useGlobalState();
  const { formData } = useForm();
  const pageContext = useDataContextManagerActions(false)?.getPageContext();

  useEffect(() => {
    registerConfigurableColumns(modalId, configurableColumns);
  }, [configurableColumns]);

  const valueId = Array.isArray(value)
    ? value.map(x => incomeValueFunc(x, {}))
    : incomeValueFunc(value, {});

  const isMultiple = mode === 'multiple';

  const onDblClick = (row: IAnyObject) => {
    if (!row) return;
    if (onSelect) {
      onSelect(row);
    } else {
      if (isMultiple) {
        const values = !!valueId ? (Array.isArray(valueId) ? valueId : [valueId]) : [];
        if (!values.includes(row.id)) {
          const vs = !!value ? (Array.isArray(value) ? value : [value]) : [];
          onChange([...vs, outcomeValueFunc(row, {})], null);
        }
      } else {
        onChange(outcomeValueFunc(row, {}), null);
      }
    }

    hidePickerDialog();
  };

  const modalProps: IModalProps = {
    id: modalId,
    isVisible: false,
    formId: addNewRecordsProps?.modalFormId,
    title: addNewRecordsProps?.modalTitle,
    showModalFooter: false, //doing this allows the modal to depend solely on the footerButtons prop
    width: addNewRecordsProps?.modalWidth,
    buttons: addNewRecordsProps?.buttons,
    footerButtons: addNewRecordsProps?.footerButtons,
    onSubmitted: (localValue: any) => {
      if (onDblClick) {
        onDblClick(localValue);
      }
    },
  };

  const dynamicModal = useModal(modalProps);

  const hasFilters = filters?.length > 0;

  const foundDynamicFilter = hasDynamicFilter(filters);

  const hasFormData = !isEmpty(formData);
  const hasGlobalState = !isEmpty(formData);
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);

  const evaluateDynamicFiltersHelper = () => {
    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: formData },
        { match: 'globalState', data: globalState },
        { match: 'pageContext', data: { ...pageContext?.getFull() } },
      ],
      propertyMetadataAccessor
    ).then(evaluatedFilters => {
      let parsedFilters = evaluatedFilters;

      const firstElement = evaluatedFilters[0];

      firstElement.defaultSelected = true;
      firstElement.selected = true;

      evaluatedFilters[0] = firstElement;

      if (hasFormData || hasGlobalState) {
        // Here we know we have evaluated our filters

        // TODO: Deal with the situation whereby the expression value evaluated to empty string because the action GetData will fail
        setPredefinedFilters(parsedFilters);
      } else if (!foundDynamicFilter) {
        // Here we do not need dynamic filters
        setPredefinedFilters(parsedFilters);
      }
    });
  };

  useEffect(() => {
    if (hasFilters) {
      evaluateDynamicFiltersHelper();
    }
  }, [filters, formData, globalState]);

  useEffect(() => {
    const { showModal } = state;
    if (showModal) {
      if (selectedStoredFilterIds?.length && selectedStoredFilterIds?.includes(UNIQUE_ID)) {
        changeSelectedStoredFilterIds([]);
      }
    }
  }, [state?.showModal]);

  if (!entityType) {
    throw SheshaError.throwPropertyError('entityType');
  }

  const onAddNew = () => {
    if (addNewRecordsProps.modalFormId) {
      hidePickerDialog();
      dynamicModal.open();
    } else console.warn('Modal Form is not specified');
  };

  const handleOnChange = (row: IAnyObject) => {
    if (onChange && !isEmpty(row)) {
      onChange(row && (row.id || row.Id), row);
    }
  };

  const onSelectRow = (_index: number, row: IAnyObject) => {
    handleOnChange(row);
  };

  const onModalOk = () => {
    if (onSelect && state?.selectedRow) {
      onSelect(state?.selectedRow);
    }
    hidePickerDialog();
  };

  const handleCancel = () => {
    hidePickerDialog();
  };

  const canAddNew = Boolean(addNewRecordsProps) && addNewRecordsProps.modalFormId;

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

  return (
    <Modal
      title={title || 'Select Item'}
      className={styles.entityPickerModal}
      open={state.showModal}
      onOk={onModalOk}
      onCancel={handleCancel}
      width={isSmall ? '90%' : width}
      okText="Select"
      footer={footer}
    >
      <>
        <Alert message="Double click an item to select" type="info" />
        <GlobalTableFilter
          searchProps={{ size: 'middle', autoFocus: true, placeholder: 'Search by Title, Type or Keyword...' }}
        />
        <div className={styles.entityPickerModalPagerContainer}>
          <TablePager />
        </div>

        <DataTable onSelectRow={onSelectRow} onDblClick={onDblClick} options={{ omitClick: true }} />
      </>
    </Modal>
  );
};

export const EntityPickerModal = (props: IEntityPickerModalProps) => {

  return (
    <DataTableProvider
      userConfigId={'table_' + props.name}
      actionOwnerName={'table_' + props.name}
      sourceType='Entity'
      entityType={props.entityType}
      dataFetchingMode='paging'
      sortMode='standard'
    >
      <EntityPickerModalInternal {...props} />
    </DataTableProvider>
  );
};