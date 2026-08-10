import { Button, Modal, Space } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { ISizableColumnProps } from './interfaces';
import { ColumnsEditor } from './columnsEditor';

export interface IProps {
  readOnly: boolean;
  value?: ISizableColumnProps[] | null | undefined;
  onChange?: ((newValue: ISizableColumnProps[]) => void) | undefined;
}

const EMPTY_VALUE: ISizableColumnProps[] = [];

export const SizableColumnsList: FC<IProps> = ({ value, onChange, readOnly }) => {
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
          <ColumnsEditor value={value ?? EMPTY_VALUE} onChange={(newValue) => onChange?.(newValue)} readOnly={readOnly} />
        </Space>
      </Modal>
    </Fragment>
  );
};

export default SizableColumnsList;
