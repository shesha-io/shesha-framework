import { Button } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsEditorModal } from './columnsEditorModal';

export interface IColumnsConfigProps {
    value?: ColumnsItemProps[];
    onChange?: (value: ColumnsItemProps[]) => void;
    readOnly?: boolean;
}

export const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange, readOnly = false }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => setModalVisible((prev) => !prev);

    return (
        <Fragment>
            <Button onClick={toggleModalVisibility}>{readOnly ? "View Columns" : "Configure Columns"}</Button>

            <ColumnsEditorModal
                visible={modalVisible}
                hideModal={toggleModalVisibility}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
            />
        </Fragment>
    );
};
