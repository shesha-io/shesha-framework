import React, { FC, Fragment, useState } from 'react';
import { Button } from 'antd';
import { FilterTarget } from './interfaces';
import { ITableViewProps } from '@/providers/tableViewSelectorConfigurator/models';
import { QueryBuilderWrapper } from '@/designer-components/queryBuilder/queryBuilderWrapper';
import { TableViewSelectorConfiguratorProvider } from '@/providers';
import { FilterSettingsModal } from './filterSettingsModal';

interface ICustomFilter {
    value?: any;
    onChange?: any;
    target?: FilterTarget;
    readOnly?: boolean;
}

export const CustomFilter: FC<ICustomFilter> = ({ value, onChange, readOnly = false }) => {
    const [showModal, setShowModal] = useState(false);

    const toggleFiltersModal = () => setShowModal((prev) => !prev);

    return (
        <Fragment>
            <Button onClick={toggleFiltersModal}>{readOnly ? 'View Filters' : 'Customise Filters'}</Button>

            <QueryBuilderWrapper>
                <TableViewSelectorConfiguratorProvider items={(value as ITableViewProps[]) || []} readOnly={readOnly}>
                    <FilterSettingsModal visible={showModal} onChange={onChange} hideModal={toggleFiltersModal} />
                </TableViewSelectorConfiguratorProvider>
            </QueryBuilderWrapper>
        </Fragment>
    );
};