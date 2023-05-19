import React, { FC } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import classNames from 'classnames';
import { onPreventDefaultClickClick } from './utils';
import { Button } from 'antd';
import { CheckListItemType, CheckListSelectionType } from './interface';
import { CloseOutlined } from '@ant-design/icons';
import { CheckListItemSelectionDto } from 'apis/checkList';

interface IChecklistTitle extends CheckListItemSelectionDto {
  title: string;
  description?: string;
  showCommentBox?: boolean;
  onChange?: (value: CheckListItemSelectionDto) => void;
  value?: string;
  readOnly?: boolean;
  hasError?: boolean;
  onBlur?: () => void;
  itemType?: CheckListItemType;
  selection?: CheckListSelectionType;
  onCheck?: (checkListItemId: string, selection: CheckListSelectionType) => void;
}

export const ChecklistTitle: FC<IChecklistTitle> = ({
  checkListItemId,
  title,
  showCommentBox,
  value,
  description,
  readOnly,
  hasError,
  itemType,
  selection,
  onChange,
  onBlur,
  onCheck,
}) => {
  const handleChange = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    const comments = event.target.value?.trim();

    if (onChange && comments) {
      onChange({ checkListItemId, comments: event.target.value });
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    onBlur();
  };

  const noAvailable =
    itemType === CheckListItemType.ThreeStateTriState && selection === CheckListSelectionType.NotAvailable;
  // selection === CheckListSelectionType.NotAvailable;

  const showNotAvailableBtn =
    itemType === CheckListItemType.ThreeStateTriState && selection === CheckListSelectionType.Yes;

  const handleButtonClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event?.preventDefault();
    event.stopPropagation();

    onCheck(checkListItemId, CheckListSelectionType.NotAvailable);
  };

  return (
    <div className="sha-checklist-title">
      <div
        className={classNames('sha-checklist-title-heading', {
          'sha-checklist-title-heading-no-available': noAvailable,
        })}
      >
        {title}
        {showNotAvailableBtn && (
          <Button icon={<CloseOutlined />} type="link" onClick={handleButtonClick} size="small" />
        )}
      </div>
      <div className="sha-checklist-title-description">{description}</div>

      {showCommentBox && (
        <div className={classNames('sha-checklist-title-comments', { 'ant-form-item-has-error': hasError })}>
          <TextArea
            key={`ChecklistTitle_${checkListItemId}`}
            style={{ width: '100%' }}
            onChange={handleChange}
            onBlur={handleBlur}
            value={value}
            onClick={onPreventDefaultClickClick}
            onFocus={onPreventDefaultClickClick}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  );
};

export default ChecklistTitle;
