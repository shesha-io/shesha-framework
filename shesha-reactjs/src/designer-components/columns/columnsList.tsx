import React, { FC, Fragment, useState } from 'react';
import { Button, Modal, Space } from 'antd';
import { ColumnsEditor } from './columnsEditor';
import { IColumnProps } from './interfaces';

export interface IProps {
  readOnly: boolean;
  value: IColumnProps[] | undefined;
  onChange: ((newValue: IColumnProps[]) => void) | undefined;
}

const EMPTY_VALUE: IColumnProps[] = [];
const EMPTY_ON_CHANGE = (_value: IColumnProps[]): void => {
  /* noop*/
};

export const ColumnsList: FC<IProps> = ({ value, onChange, readOnly }) => {
  const [showDialog, setShowDialog] = useState(false);

  const toggleModal = (): void => setShowDialog((prevVisible) => !prevVisible);

  return (
    <Fragment>
      <Button size="small" onClick={toggleModal}>{readOnly ? 'View Columns' : 'Configure Columns'}</Button>

      <Modal
        title={readOnly ? 'View Columns' : 'Configure Columns'}
        open={showDialog}
        width="650px"
        onOk={toggleModal}
        okButtonProps={{ hidden: readOnly }}
        onCancel={toggleModal}
        cancelText={readOnly ? 'Close' : undefined}
      >
        <Space orientation="vertical" style={{ width: '100%' }}>
          <ColumnsEditor
            value={value ?? EMPTY_VALUE}
            onChange={onChange ?? EMPTY_ON_CHANGE}
            readOnly={readOnly}
          />
        </Space>
      </Modal>
    </Fragment>
  );
};

export default ColumnsList;
