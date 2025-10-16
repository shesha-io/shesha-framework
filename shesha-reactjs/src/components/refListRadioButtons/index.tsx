import React, { CSSProperties, FC, Key } from 'react';
import { Radio, RadioChangeEvent, RadioGroupProps } from 'antd';
import { nanoid } from '@/utils/uuid';
import { ReferenceListItemDto } from '@/apis/referenceList';
import classNames from 'classnames';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getLegacyReferenceListIdentifier } from '@/utils/referenceList';
import { useStyles } from './styles/styles';

const RadioButton = Radio.Button;

export interface IRefListDropDownOption {
  children?: string;
  key: string;
  value?: Key;
}

export interface IRefListRadioButtonsProps extends RadioGroupProps {
  /** Reference list name */
  listName: string;

  /** Reference list namespace */
  listNamespace: string;

  /** Filters - these are the reference list values that you want to show. If passed, only these will be shown and the rest won't */
  filters?: number[];

  /** The orientation of the radio button */
  orientation?: 'vertical' | 'inline';

  /**
   * A callback for when the selections change
   */
  onSelectionChange?: (value: number, event?: RadioChangeEvent) => void;

  /** The selected value */
  value?: number | ReferenceListItemDto;
}

/** A component for displaying reference list item as radio buttons */
const RefListRadioButtons: FC<IRefListRadioButtonsProps> = ({
  listName,
  listNamespace,
  value,
  filters = [],
  orientation = 'inline',
  optionType = 'default',
  onChange,
  onSelectionChange,
  ...rest
}) => {
  const { styles } = useStyles();
  const { data: refList } = useReferenceList(getLegacyReferenceListIdentifier(listNamespace, listName));

  const filter = ({ itemValue }: ReferenceListItemDto): boolean => {
    return filters.includes(itemValue);
  };

  const numericValue = typeof value === 'number' ? value : value?.itemValue;

  const options = filters?.length ? refList?.items?.filter(filter) : refList?.items;

  const radioProps = { ...rest, value: options ? numericValue : null };

  const RadioType = optionType === 'button' ? RadioButton : Radio;

  const radioStyle: CSSProperties =
    orientation === 'vertical' ? { display: 'block', height: '30px', lineHeight: '30px' } : {};

  const handleChange = (event: RadioChangeEvent): void => {
    if (onSelectionChange) {
      onSelectionChange(event?.target?.value, event);
    }

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <Radio.Group onChange={handleChange} {...radioProps} className={styles.shaRefListRadioButtons}>
      {options?.map(({ item, itemValue }) => (
        <RadioType
          value={itemValue}
          style={radioStyle}
          key={nanoid()}
          className={classNames({ [styles.buttonsVertical]: orientation === 'vertical' && optionType === 'button' })}
        >
          {item}
        </RadioType>
      ))}
    </Radio.Group>
  );
};

export default RefListRadioButtons;
