import { Button } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnsEditorModal } from './columnsEditorModal';

interface IColumnsConfigProps {
    value?: ColumnsItemProps[];
    onChange?: (value: ColumnsItemProps[]) => void;
    readonly?: boolean;
}

export const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange, readonly = false }) => {
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
                readOnly={readonly}
            />
        </Fragment>
    );
};
