import React, { FC, Fragment, useMemo, useState } from 'react';
import { ListEditor } from '@/components';
import { nanoid } from '@/utils/uuid';
import { Button, Modal, InputNumber } from 'antd';
import { ISizableColumnProps } from './interfaces';
import { DefaultGroupHeader } from '@/components/listEditorWithPropertiesPanel/defaultGroupHeader';
import { usePrevious } from 'react-use';

export interface IProps {
  readOnly: boolean;
  value?: ISizableColumnProps[];
  onChange?: any;
}

export const SizableColumnsList: FC<IProps> = ({ value, onChange, readOnly }) => {

  const [showDialog, setShowDialog] = useState(false);
  const preValue = usePrevious(value);

  const toggleModal = () => setShowDialog((prevVisible) => !prevVisible);


  const hasOrderChanged = useMemo((): boolean => {
    // Compare lengths - can save a lot of time
    if (preValue?.length !== value?.length) return true;

    for (let i = 0; i < preValue?.length; i++) {
      if (preValue[i] !== value[i]) {
        return true;
      }
    }

    return false;
  }
    , [preValue, value]);

  return (
    <Fragment>
      <Button onClick={toggleModal}>{readOnly ? 'View Columns' : 'Configure Columns'}</Button>

      <Modal
        title={readOnly ? 'View Columns' : 'Configure Columns'}
        open={showDialog}
        width="650px"
        onOk={toggleModal}
        okButtonProps={{ hidden: readOnly }}
        onCancel={toggleModal}
        cancelText={readOnly ? 'Close' : undefined}
      >
        <ListEditor<ISizableColumnProps>

          value={[...value]}
          onChange={onChange}
          initNewItem={(_items) => ({
            id: nanoid(),
            size: 25,
            components: [],
          })
          }
          readOnly={readOnly}
          header={(headerProps) => <DefaultGroupHeader {...headerProps} addItemText={'Add Column'} />}
          key={hasOrderChanged ? 'new-order' : 'original-order'}
        >
          {({ item, itemOnChange, readOnly }) => {
            return <InputNumber
              style={{ marginLeft: '1.5rem' }}
              defaultValue={item?.size}
              disabled={readOnly}
              onChange={value => itemOnChange({
                ...item, size: value
              })}
            />
          }
          }
        </ListEditor>
      </Modal>
    </Fragment>
  );
};

export default SizableColumnsList;
