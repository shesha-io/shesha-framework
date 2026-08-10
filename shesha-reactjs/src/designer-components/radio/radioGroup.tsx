import { Radio, Space } from 'antd';
import React, { ReactElement, useMemo } from 'react';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList } from './utils';
import { ILabelValue } from '../dropdown/model';
import { IRadioOptionsSource, IRadioProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { useUrlDataSource } from '../_common/useUrlDataSource';

const EMPTY_ITEMS: ILabelValue[] = [];

/**
 * Resolves the options of a radio group from the configured data source
 * (a fixed list of values, a reference list, or an API URL).
 * Extracted from the group so that the component API can expose the same list.
 *
 * `enabled` lets a caller that already holds resolved options keep the hook inert
 * instead of fetching the same URL data source a second time.
 */
export const useRadioOptions = (model: Partial<IRadioOptionsSource>, enabled: boolean = true): ILabelValue[] => {
  const { referenceListId } = model;
  const { data: refListItems } = useReferenceList(enabled ? referenceListId : undefined);
  const urlData = useUrlDataSource(model, enabled);

  // A stable reference for the unset case: defaulting to `[]` in the destructuring would allocate
  // a new array on every render, changing the memo's dependency and so the identity of the
  // returned options — which would re-run the component API effect in radio.tsx each time.
  const items = model.items ?? EMPTY_ITEMS;

  return useMemo(
    () => getDataSourceList(model.dataSourceType ?? 'values', items, refListItems?.items, urlData),
    [model.dataSourceType, items, refListItems?.items, urlData],
  );
};

const RadioGroup = (model: IRadioProps & { ref?: React.Ref<HTMLDivElement> }): ReactElement => {
  const { ref, value } = model;
  // Options resolved by the caller win; otherwise fall back to resolving them here.
  const hasSuppliedOptions = isDefined(model.options);
  const resolvedOptions = useRadioOptions(model, !hasSuppliedOptions);
  const options = model.options ?? resolvedOptions;
  const isDisabled = model.disabled === true || model.readOnly === true;

  const renderCheckGroup = (): ReactElement => (
    <Radio.Group
      ref={ref}
      {...(isNotNullOrWhiteSpace(model.className) ? { className: model.className } : {})}
      disabled={isDisabled}
      value={value != null ? `${value}` : undefined}
      {...(model.onBlur ? { onBlur: model.onBlur } : {})}
      {...(model.onFocus ? { onFocus: model.onFocus } : {})}
      {...(model.onChange ? { onChange: model.onChange } : {})}
      {...(model.onClick ? { onClick: model.onClick } : {})}
      {...(model.onMouseEnter ? { onMouseEnter: model.onMouseEnter } : {})}
      {...(model.onMouseLeave ? { onMouseLeave: model.onMouseLeave } : {})}
      {...(model.style ? { style: model.style } : {})}
    >
      <Space
        {...(model.direction ? { orientation: model.direction } : {})}
        style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
      >
        {options.map((checkItem, index) => (
          <Radio key={index} value={`${checkItem.value}`} disabled={isDisabled}>
            {checkItem.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  return renderCheckGroup();
};

export default RadioGroup;
