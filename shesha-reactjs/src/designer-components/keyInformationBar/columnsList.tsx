import React, { FC, Fragment, ReactElement, useState } from 'react';
import { Button, Modal, Space, Tooltip } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { KeyInfomationBarItemProps } from './interfaces';
import { ColumnsEditor } from './columnsEditor';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { strings } from '@/components/keyInformationBar/utils';

export interface IProps {
  readOnly: boolean;
  value: KeyInfomationBarItemProps[] | undefined;
  onChange: ((newValue: KeyInfomationBarItemProps[]) => void) | undefined;
  size?: SizeType | undefined;
}

const tooltip = (): ReactElement => (
  <Tooltip title={strings.tooltip}>
    <QuestionCircleOutlined className="tooltip-question-icon" size={14} color="gray" />
  </Tooltip>
);

const EMPTY_VALUE: KeyInfomationBarItemProps[] = [];
const EMPTY_ON_CHANGE = (_: KeyInfomationBarItemProps[]): void => {
  // noop
};

export const ColumnsList: FC<IProps> = ({ value, onChange, readOnly, size }) => {
  const [showDialog, setShowDialog] = useState(false);

  const toggleModal = (): void => setShowDialog((prevVisible) => !prevVisible);

  return (
    <Fragment>
      <Button size={size} onClick={toggleModal}>{readOnly ? 'View Columns' : 'Configure Columns'}</Button>

      <Modal
        title={readOnly ? 'View Columns' : <>Configure Columns {tooltip()}</>}
        open={showDialog}
        width="650px"

        onOk={toggleModal}
        okButtonProps={{ hidden: readOnly }}

        onCancel={toggleModal}
        cancelText={readOnly ? 'Close' : undefined}
      >
        <Space orientation="vertical" style={{ width: '100%' }}>
          <ColumnsEditor value={value ?? EMPTY_VALUE} onChange={onChange ?? EMPTY_ON_CHANGE} readOnly={readOnly} />
        </Space>
      </Modal>
    </Fragment>
  );
};

export default ColumnsList;
