import { Button } from 'antd';
import React, { FC, Fragment } from 'react';
import { IEntityPickerComponentProps } from '.';
import { useDataTable, useModal } from '../../../../providers';
import { IModalProps } from '../../../../providers/dynamicModal/models';
import transformJS from 'js-to-json-logic';
import { IStoredFilter } from '../../../../providers/dataTable/interfaces';

const UNIQUE_ID = 'HjHi0UVD27o8Ub8zfz6dH';

const EntityFooter: FC<IEntityPickerComponentProps> = props => {
  const { setPredefinedFilters, changeSelectedStoredFilterIds } = useDataTable();
  const modalProps: IModalProps = {
    id: props?.id,
    isVisible: false,
    formId: props?.modalFormId,
    title: props?.modalTitle,
    showModalFooter: props?.showModalFooter,
    submitHttpVerb: props?.submitHttpVerb,
    onSuccessRedirectUrl: props?.onSuccessRedirectUrl,
    onSubmitted: (value: any) => {
      const storedFilter: IStoredFilter = {
        expression: transformJS(`Id === "${value?.id}"`),
        name: 'EntityPickerInner filter',
        id: UNIQUE_ID,
      };

      setPredefinedFilters([storedFilter]);
      changeSelectedStoredFilterIds([UNIQUE_ID]);
    },
  };

  const dynamicModal = useModal(modalProps);

  const onAddNew = () => {
    if (props.modalFormId) {
      dynamicModal.open();
    } else console.warn('Modal Form is not specified');
  };

  if (props.allowNewRecord) {
    return (
      <Button type="primary" onClick={onAddNew}>
        Add New
      </Button>
    );
  }

  return <Fragment />;
};

export default EntityFooter;
