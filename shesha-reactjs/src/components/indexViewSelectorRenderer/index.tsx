import React, { FC } from 'react';
import { BulbTwoTone, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Popover, Tooltip } from 'antd';
import { IStoredFilter } from '../../providers/dataTable/interfaces';
import Show from '../show';
import { nanoid } from 'nanoid/non-secure';

export interface IIndexViewSelectorRendererProps {
  header?: string;
  filters?: IStoredFilter[];
  selectedFilterId?: string;
  onSelectFilter: (id?: string) => void;
}

export const IndexViewSelectorRenderer: FC<IIndexViewSelectorRendererProps> = ({
  header,
  filters,
  selectedFilterId,
  onSelectFilter,
}) => {
  const defaultView: IStoredFilter = {
    id: null,
    name: header,
  };

  const selectedFilter = selectedFilterId
    ? filters.find(f => f.id === selectedFilterId)
    : !header && filters?.length
    ? filters[0]
    : null;

  const { hasDynamicExpression, allFieldsEvaluatedSuccessfully, unevaluatedExpressions } = selectedFilter || {};

  const getPopoverHintContent = () => {
    if (unevaluatedExpressions) {
      return (
        <div style={{ width: 450 }}>
          <div>
            This filter has dynamic expressions which have not been evaluated. Below are the filters which have not been
            evaluated
          </div>

          <ul>
            {unevaluatedExpressions?.map(item => (
              <li key={nanoid()}>{item}</li>
            ))}
          </ul>

          <div>Please make sure you enter the relevant data</div>
        </div>
      );
    }

    return null;
  };

  const allFilters = header ? [defaultView, ...filters] : filters;

  const viewsToSelect: IStoredFilter[] = allFilters.filter(view => {
    return view.id ? view.id !== selectedFilterId : Boolean(selectedFilterId);
  });

  const Item = ({ id: currentId, name: currentName, tooltip }: IStoredFilter) => {
    return (
      <span key={currentId} onClick={() => onSelectFilter(currentId)} className="custom-filter-container">
        {currentName}
        {tooltip && <TooltipIcon tooltip={tooltip} />}
      </span>
    );
  };

  if (filters?.length === 1 && !Boolean(header)) {
    return (
      <div className="index-view-selector">
        <h2 className="title">
          {selectedFilter.name} {selectedFilter.tooltip && <TooltipIcon tooltip={selectedFilter.tooltip} />}
        </h2>
      </div>
    );
  }

  return (
    <div className="index-view-selector">
      <Dropdown
        trigger={['click']}
        overlay={() => (
          <Menu className="index-view-selector-menu">
            {viewsToSelect.map(({ id, name, tooltip }: IStoredFilter) => (
              <Menu.Item key={id}>
                <Item key={id} {...{ id, name, tooltip }} />
              </Menu.Item>
            ))}
          </Menu>
        )}
      >
        <h2 className="title">
          {selectedFilter ? (
            <>
              {selectedFilter.name} {selectedFilter.tooltip && <TooltipIcon tooltip={selectedFilter.tooltip} />}
            </>
          ) : (
            header
          )}
          {filters.length > 0 && <DownOutlined style={{ marginLeft: '5px' }} />}

          <Show when={hasDynamicExpression && !allFieldsEvaluatedSuccessfully}>
            <Popover content={getPopoverHintContent} trigger="hover" title="Some fields have not been evaluated">
              <span className="index-view-selector-bulb">
                <BulbTwoTone twoToneColor="orange" />
              </span>
            </Popover>
          </Show>
        </h2>
      </Dropdown>
    </div>
  );
};

interface ITooltipIconProps {
  tooltip: string;
}
const TooltipIcon: FC<ITooltipIconProps> = ({ tooltip }) => {
  return (
    <Tooltip title={tooltip} className="sha-tooltip-icon">
      <QuestionCircleOutlined />
    </Tooltip>
  );
};

export default IndexViewSelectorRenderer;
