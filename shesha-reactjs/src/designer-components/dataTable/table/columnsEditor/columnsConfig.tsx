import { Button } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsEditorModal } from './columnsEditorModal';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IColumnsConfigProps {
  value?: ColumnsItemProps[];
  onChange?: (value: ColumnsItemProps[]) => void;
  readOnly?: boolean;
  size?: SizeType;
  parentComponentType?: string;
}

export const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange, readOnly = false, size, parentComponentType }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModalVisibility = (): void => setModalVisible((prev) => !prev);

  return (
    <Fragment>
      <Button size={size} onClick={toggleModalVisibility}>{readOnly ? "View Columns" : "Configure Columns"}</Button>

      <ColumnsEditorModal
        visible={modalVisible}
        hideModal={toggleModalVisibility}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        parentComponentType={parentComponentType}
      />
    </Fragment>
  );
};
