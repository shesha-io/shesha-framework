import { EllipsisOutlined } from '@ant-design/icons';
import { Alert, Button, Space, Modal, Select, Skeleton } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import _, { isEmpty } from 'lodash';
import { nanoid } from '@/utils/uuid';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useMedia } from 'react-use';
import { IAnyObject } from '@/interfaces';
import { useForm, useGlobalState, useModal, useNestedPropertyMetadatAccessor } from '@/providers';
import DataTableProvider, { useDataTable } from '@/providers/dataTable';
import { hasDynamicFilter } from '@/providers/dataTable/utils';
import { IModalProps } from '@/providers/dynamicModal/models';
import { useEntitySelectionData } from '@/utils/entity';
import GlobalTableFilter from '@/components/globalTableFilter';
import { DataTable } from '@/components/dataTable';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import TablePager from '@/components/tablePager';
import { IEntityPickerProps, IEntityPickerState } from './models';
import { evaluateDynamicFilters } from '@/utils';
import { useDeepCompareMemo } from '@/hooks';
import { useStyles } from './styles/styles';

const UNIQUE_ID = 'HjHi0UVD27o8Ub8zfz6dH';

export const EntityPickerReadOnly = (props: IEntityPickerProps) => {
  const { entityType, displayEntityKey, value } = props;

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: Array.isArray(value)
      ? value.map(x => props.incomeValueFunc(x, {}))
      : props.incomeValueFunc(value, {}),
  });
  const selectedItems = selection?.rows;

  const displayText = useMemo(() => {
    return selectedItems?.map(ent => ent[displayEntityKey]).join(', ');
  }, [selectedItems]);

  return selection.loading ? <Skeleton paragraph={false} active /> : <ReadOnlyDisplayFormItem value={displayText} />;
};

export const EntityPickerEditableInner = (props: IEntityPickerProps) => {
  const {
    entityType,
    displayEntityKey,
    filters,
    onChange,
    disabled,
    loading,
    value,
    mode,
    size,
    style,
    useButtonPicker,
    pickerButtonProps,
    onSelect,
    defaultValue,
    title = 'Select Item',
    addNewRecordsProps,
    configurableColumns,
    width,
    outcomeValueFunc,
    incomeValueFunc,
    placeholder
  } = props;

  const { styles } = useStyles();
  const [modalId] = useState(nanoid()); // use generated value because formId was changed. to be reviewed
  const [state, setState] = useState<IEntityPickerState>({
    showModal: false,
  });
  const isSmall = useMedia('(max-width: 480px)');

  const {
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    registerConfigurableColumns,
    setPredefinedFilters,
  } = useDataTable();
  const { globalState } = useGlobalState();
  const { formData } = useForm();
  const selectRef = useRef(undefined);

  useEffect(() => {
    registerConfigurableColumns(modalId, configurableColumns);
  }, [configurableColumns]);

  const showPickerDialog = () => setState(prev => ({ ...prev, showModal: true }));

  const hidePickerDialog = () => setState(prev => ({ ...prev, showModal: false }));

  const valueId = Array.isArray(value)
    ? value.map(x => props.incomeValueFunc(x, {}))
    : props.incomeValueFunc(value, {});

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: valueId,
  });
  const selectedItems = selection?.rows;

  const selectedMode = mode === 'single' ? undefined : mode;

  const isMultiple = mode === 'multiple';

  const onDblClick = (row: IAnyObject) => {
    if (!row) return;
    if (onSelect) {
      onSelect(row);
    } else {
      if (isMultiple) {
        const values = !!valueId ? (Array.isArray(valueId) ? valueId : [valueId]): [];
        if (!values.includes(row.id)) {
          const vs = !!value ? (Array.isArray(value) ? value : [value]): [];
          onChange([...vs, props.outcomeValueFunc(row, {})], null);
        }
      } else {
        onChange(props.outcomeValueFunc(row, {}),null);
      }
    }

    hidePickerDialog();
  };

  const modalProps: IModalProps = {
    id: modalId,
    isVisible: false,
    formId: addNewRecordsProps?.modalFormId,
    title: addNewRecordsProps?.modalTitle,
    showModalFooter: addNewRecordsProps?.showModalFooter,
    submitHttpVerb: addNewRecordsProps?.submitHttpVerb,
    onSuccessRedirectUrl: addNewRecordsProps?.onSuccessRedirectUrl,
    width: addNewRecordsProps?.modalWidth,
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
    throw new Error('Please make sure that either entityType is configured for the entity picker to work properly');
  }

  const onAddNew = () => {
    if (addNewRecordsProps.modalFormId) {
      hidePickerDialog();
      dynamicModal.open();
    } else console.warn('Modal Form is not specified');
  };

  const handleOnChange = (row: IAnyObject) => {
    if (onChange && !_.isEmpty(row)) {
      onChange(row && (row.id || row.Id), row);
    }
  };

  const onSelectRow = (_index: number, row: IAnyObject) => {
    handleOnChange(row);
  };

  const handleMultiChange = selectedValues => {
    if (onChange) onChange(selectedValues, null);
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

  const handleButtonPickerClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event?.stopPropagation();

    showPickerDialog();
  };

  const options = useDeepCompareMemo<DefaultOptionType[]>(() => {
    let result: DefaultOptionType[] = null;
    if (selection.loading) {
      const items = valueId ? (Array.isArray(valueId) ? valueId : [valueId]) : [];
      result = items.map(item => ({ label: 'loading...', value: item, key: item }));
    } else {
      result = (selectedItems ?? []).map(ent => {
        const key = incomeValueFunc(outcomeValueFunc(ent, {}), {});
        return { label: ent[displayEntityKey], value: key, key };
      });
    }

    return result;
  }, [selectedItems]);

  const canAddNew = Boolean(addNewRecordsProps) && addNewRecordsProps.modalFormId;

  const footer = (
    <Fragment>
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
    </Fragment>
  );

  return (
    <div className={styles.entityPickerContainer}>
      <div>
        {useButtonPicker ? (
          <Button onClick={handleButtonPickerClick} size={size} {...(pickerButtonProps || {})}>
            {title}
          </Button>
        ) : (
          <Space.Compact style={{ width: '100%' }}>
            <Select
              size={size}
              onClick={() => {
                selectRef.current.blur();
                showPickerDialog();
              }}
              value={selection.loading ? undefined : valueId}
              placeholder={selection.loading ? 'Loading...' : placeholder}
              notFoundContent={''}
              defaultValue={defaultValue}
              disabled={disabled || selection.loading}
              ref={selectRef}
              allowClear
              mode={selectedMode}
              options={options}
              suffixIcon={null} // hide arrow              
              onChange={handleMultiChange}
              style={{ ...style, width: `calc(100% - ${size === 'large'? '40px' : '32px'})` }}
              loading={selection.loading}
            >
              {''}
            </Select>
            <Button
              onClick={showPickerDialog}
              className={styles.pickerInputGroupEllipsis}
              disabled={disabled}
              loading={loading ?? false}
              size={size}
              icon={<EllipsisOutlined />}
            />
          </Space.Compact>
        )}
      </div>

      <Modal
        title={title || 'Select Item'}
        className={styles.entityPickerModal}
        open={state?.showModal}
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
    </div>
  );
};

export const EntityPickerEditable = (props: IEntityPickerProps) => {
  const { entityType, displayEntityKey, disabled } = props;
  return (
    <>
      <DataTableProvider
        userConfigId={'table_' + props.name}
        actionOwnerName={'table_' + props.name}
        sourceType='Entity'
        entityType={entityType}
        dataFetchingMode='paging'
      >
        <EntityPickerEditableInner {...props} disabled={disabled} displayEntityKey={displayEntityKey} />
      </DataTableProvider>
    </>
  );
};

export const EntityPicker = ({ displayEntityKey = '_displayName', ...restProps }: IEntityPickerProps) => {
  return restProps.readOnly ? (

    <EntityPickerReadOnly {...restProps} displayEntityKey={displayEntityKey} />
  ) : (
    <EntityPickerEditable {...restProps} displayEntityKey={displayEntityKey} />
  );
};

export default EntityPicker;
