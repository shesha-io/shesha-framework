import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox, CheckboxOptionType } from 'antd';
import React, { CSSProperties, FC, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './interfaces';
import { executeScriptSync } from '@/providers/form/utils';
import { IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { useStyles } from './styles';

type RawOptionsPayload = ILabelValue<unknown>[] | { items: ILabelValue<unknown>[] };
type FetchResponse = IAjaxResponse<RawOptionsPayload> | RawOptionsPayload;

type CheckboxGroupOptionsSource = Pick<ICheckboxGroupProps, 'items' | 'referenceListId' | 'dataSourceType' | 'dataSourceUrl' | 'reducerFunc'>;

/**
 * Resolves the options of a checkbox group from the configured data source
 * (a fixed list of values, a reference list, or a URL).
 * Extracted from the group so the readOnly display can render the same labels.
 *
 * `enabled` lets a caller that already holds resolved options keep the hook inert
 * instead of fetching the same URL data source a second time.
 */
export const useCheckboxGroupOptions = (model: CheckboxGroupOptionsSource, enabled: boolean = true): CheckboxOptionType[] => {
  const { items = [], referenceListId } = model;
  const { data: refList } = useReferenceList(enabled ? referenceListId : undefined);

  //#region Data source is url
  const { refetch, data } = useGet<FetchResponse>({ path: model.dataSourceUrl ?? "", lazy: true });

  useEffect(() => {
    if (enabled && model.dataSourceType === 'url' && isNotNullOrWhiteSpace(model.dataSourceUrl)) {
      refetch().catch((error) => {
        console.error('Failed to fetch options', error);
      });
    }
  }, [enabled, model.dataSourceType, model.dataSourceUrl, refetch]);

  const fetchedData = useMemo<RawOptionsPayload | undefined>(() => {
    if (!data) return undefined;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && 'success' in data) {
      const response = data as IAjaxResponse<RawOptionsPayload>;
      if (isAjaxSuccessResponse(response)) {
        const result = response.result;
        if (isDefined(result) && !Array.isArray(result) && typeof result === 'object' && 'configuration' in result) {
          const config = (result as { configuration?: { items?: ILabelValue<unknown>[] } }).configuration;
          if (config?.items && Array.isArray(config.items)) return config.items;
        }
        return result;
      }
      return undefined;
    }
    if (typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return data as { items: ILabelValue<unknown>[] };
    }
    return undefined;
  }, [data]);

  const reducedData = useMemo<ILabelValue<unknown>[] | undefined>(() => {
    if (!fetchedData) return undefined;

    const list = Array.isArray(fetchedData)
      ? fetchedData
      : (typeof fetchedData === 'object' && 'items' in fetchedData && Array.isArray(fetchedData.items))
        ? fetchedData.items
        : [];

    if (Array.isArray(list) && isNotNullOrWhiteSpace(model.reducerFunc)) {
      return executeScriptSync(model.reducerFunc, { data: list });
    }

    return list;
  }, [fetchedData, model.reducerFunc]);
  //#endregion

  return useMemo<CheckboxOptionType[]>(() => {
    const list = getDataSourceList(model.dataSourceType, items, refList?.items, reducedData);
    return list.map<CheckboxOptionType>((item) => (item.id ? item : { ...item, id: nanoid(), key: nanoid() }));
  }, [model.dataSourceType, items, refList?.items, reducedData]);
};

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { direction, value, onChange } = model;
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose the focus target to the component API without threading a ref
  // through props (the group has no single focusable input element).
  useImperativeHandle(model.focusRef, () => ({ focus: () => containerRef.current?.focus() }), []);

  // Options resolved by the caller win; otherwise fall back to resolving them here. The hook is
  // kept inert when the caller supplied options so a `url` data source is not fetched twice.
  const hasSuppliedOptions = isDefined(model.options);
  const resolvedOptions = useCheckboxGroupOptions(model, !hasSuppliedOptions);
  const options = model.options ?? resolvedOptions;

  // Per-checkbox appearance (check mark, dimensions, border, background, etc.)
  // is emitted by the scoped emotion class onto each `.ant-checkbox-inner`;
  // only layout stays on the group container.
  const { styles } = useStyles(model);

  const isDisabled = model.disabled === true || model.readOnly === true;

  const checkboxGroupStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    flexWrap: direction === 'vertical' ? 'nowrap' : 'wrap',
    gap: '8px',
    // Honour the Custom style (styleJson) at the group level.
    ...(isDefined(model.styleJson) ? model.styleJson : {}),
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onFocus={(e) => model.onFocus?.({ ...e, target: { ...e.target, value: value } })}
      onBlur={(e) => model.onBlur?.({ ...e, target: { ...e.target, value: value } })}
      onClick={model.onClick}
      onMouseEnter={model.onMouseEnter}
      onMouseMove={model.onMouseMove}
      onMouseLeave={model.onMouseLeave}
      onKeyDown={model.onKeyDown}
      onKeyUp={model.onKeyUp}
      style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
    >
      <Checkbox.Group
        className={styles.checkboxGroup}
        disabled={isDisabled}
        value={isDefined(value) ? (Array.isArray(value) ? value : [value]) : []}
        {...(onChange ? { onChange } : {})}
        style={checkboxGroupStyle}
        options={options}
      />
    </div>
  );
};

export default MultiCheckbox;
