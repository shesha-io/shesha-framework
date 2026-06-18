import { Button } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsEditorModal } from './columnsEditorModal';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IColumnsConfigProps {
  value?: ColumnsItemProps[] | undefined;
  onChange?: ((value: ColumnsItemProps[]) => void) | undefined;
  readOnly?: boolean | undefined;
  size?: SizeType | undefined;
  parentComponentType?: string | undefined;
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
