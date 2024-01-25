import FilterConfigurator from './filterConfigurator';
import React, { FC } from 'react';
import { FilterTarget } from './interfaces';
import { Modal } from 'antd';
import { useMedia } from 'react-use';
import { useTableViewSelectorConfigurator } from '@/providers';

export interface IFilterSettingsModal {
    visible: boolean;
    hideModal: () => void;
    value?: object;
    onChange?: any;
    target?: FilterTarget;
}

export const FilterSettingsModal: FC<IFilterSettingsModal> = ({ visible, onChange, hideModal }) => {
    const { items, readOnly } = useTableViewSelectorConfigurator();
    const isSmall = useMedia('(max-width: 480px)');

    const onOkClick = () => {
        if (typeof onChange === 'function') onChange(items);
        hideModal();
    };

    return (
        <Modal
            width={isSmall ? '90%' : '60%'}
            open={visible}
            title={readOnly ? 'View Filters' : 'Configure Filters'}
            onCancel={hideModal}
            cancelText={readOnly ? 'Close' : undefined}
            okText="Save"
            onOk={onOkClick}
            okButtonProps={{ hidden: readOnly }}
        >
            <FilterConfigurator />
        </Modal>
    );
};