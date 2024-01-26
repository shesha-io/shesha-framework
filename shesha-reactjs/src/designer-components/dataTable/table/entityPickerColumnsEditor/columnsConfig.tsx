import React, { FC, Fragment, useState } from 'react';
import { Button } from 'antd';
import { ColumnsEditorModal } from './columnsEditorModal';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';

interface IColumnsConfigProps {
    value?: ColumnsItemProps[];
    onChange?: (value: ColumnsItemProps[]) => void;
    readOnly: boolean;
}

export const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange, readOnly }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModalVisibility = () => setModalVisible((prev) => !prev);

    return (
        <Fragment>
            <Button onClick={toggleModalVisibility}>Configure Columns</Button>

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