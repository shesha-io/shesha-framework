import { Radio, Space } from 'antd';
import { ReactElement, useMemo } from 'react';
import * as React from 'react';
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

  /* Every configured handler goes on this wrapper, matching the checkbox group. antd's
     Radio.Group renders its div through `pickAttrs(props, { aria: true, data: true })` and
     forwards only onMouseEnter/onMouseLeave/onFocus/onBlur, silently dropping onClick,
     onMouseMove, onKeyDown and onKeyUp — so hosting them here is what makes them fire at all,
     and keeps every handler reporting the same element as `event.currentTarget`.

     The class stays on Radio.Group: the Appearance styles are scoped to it and its options. */
  const renderCheckGroup = (): ReactElement => (
    <div
      ref={ref}
      onFocus={isDisabled ? undefined : model.onFocus}
      onBlur={isDisabled ? undefined : model.onBlur}
      onClick={isDisabled ? undefined : model.onClick}
      onMouseEnter={isDisabled ? undefined : model.onMouseEnter}
      onMouseMove={isDisabled ? undefined : model.onMouseMove}
      onMouseLeave={isDisabled ? undefined : model.onMouseLeave}
      onKeyDown={isDisabled ? undefined : model.onKeyDown}
      onKeyUp={isDisabled ? undefined : model.onKeyUp}
      {...(model.style ? { style: model.style } : {})}
    >
      <Radio.Group
        {...(isNotNullOrWhiteSpace(model.className) ? { className: model.className } : {})}
        disabled={isDisabled}
        value={value != null ? `${value}` : undefined}
        {...(model.onChange ? { onChange: model.onChange } : {})}
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
    </div>
  );

  return renderCheckGroup();
};

export default RadioGroup;
