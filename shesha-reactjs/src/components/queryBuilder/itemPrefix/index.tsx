import React from 'react';
import classNames from 'classnames';
import { Select } from 'antd';

interface IRelationOption {
  value: string;
  label: string;
}

interface IItemPrefixProps {
  isFirstInLevel: boolean;
  readonly: boolean;
  options: IRelationOption[];
  selectedRelation: string;
  renderSize?: 'small' | 'medium' | 'large';
  onChange: (value: string) => void;
}

export const ItemPrefix = ({
  isFirstInLevel,
  readonly,
  options,
  selectedRelation,
  renderSize,
  onChange,
}: IItemPrefixProps): JSX.Element => {
  const stopEventPropagation = (event: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };

  return (
    <div
      className={classNames('sha-query-builder-item-prefix', {
        'sha-query-builder-item-prefix--where': isFirstInLevel,
        'sha-query-builder-item-prefix--relation': !isFirstInLevel,
      })}
    >
      {isFirstInLevel ? (
        <span className="sha-query-builder-item-prefix-label">Where</span>
      ) : (
        <div
          className="sha-query-builder-item-relation"
          onMouseDown={stopEventPropagation}
          onPointerDown={stopEventPropagation}
        >
          {options.length > 0 && (
            <Select
              value={selectedRelation}
              options={options}
              onChange={onChange}
              disabled={readonly}
              popupMatchSelectWidth={false}
              size={renderSize === 'medium' ? 'middle' : renderSize}
            />
          )}
        </div>
      )}
    </div>
  );
};
