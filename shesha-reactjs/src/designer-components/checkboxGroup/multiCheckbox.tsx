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

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items = [], referenceListId, direction, value, onChange } = model;
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose the focus target to the component API without threading a ref
  // through props (the group has no single focusable input element).
  useImperativeHandle(model.focusRef, () => ({ focus: () => containerRef.current?.focus() }), []);

  const { data: refList } = useReferenceList(referenceListId);
  const { refetch, data } = useGet<FetchResponse>({ path: model.dataSourceUrl ?? "", lazy: true });

  useEffect(() => {
    if (isNotNullOrWhiteSpace(model.dataSourceUrl) && model.dataSourceType === 'url') {
      refetch().catch((error) => {
        console.error('Failed to fetch options', error);
      });
    }
  }, [model.dataSourceType, model.dataSourceUrl, refetch]);

  const fetchedData = useMemo<RawOptionsPayload | undefined>(() => {
    if (!isDefined(data)) return undefined;
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

  const reducedData = useMemo<ILabelValue<unknown>[]>(() => {
    if (!isDefined(fetchedData)) return [];

    const list = Array.isArray(fetchedData)
      ? fetchedData
      : (typeof fetchedData === 'object' && 'items' in fetchedData && Array.isArray(fetchedData.items))
        ? fetchedData.items
        : [];

    if (Array.isArray(list) && isNotNullOrWhiteSpace(model.reducerFunc)) {
      return executeScriptSync(model.reducerFunc, { data: list }) ?? [];
    }

    return list;
  }, [fetchedData, model.reducerFunc]);

  const options = useMemo<CheckboxOptionType[]>(() => {
    const list = getDataSourceList(model.dataSourceType, items, refList?.items, reducedData);
    return list.map<CheckboxOptionType>((item) => (item.id ? item : { ...item, id: nanoid(), key: nanoid() }));
  }, [model.dataSourceType, items, refList?.items, reducedData]);

  // Per-checkbox appearance (check mark, dimensions, border, background, etc.)
  // is emitted by the scoped emotion class onto each `.ant-checkbox-inner`;
  // only layout stays on the group container.
  const { styles } = useStyles(model);

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
      onMouseLeave={model.onMouseLeave}
      onKeyDown={model.onKeyDown}
      onKeyUp={model.onKeyUp}
      style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
    >
      <Checkbox.Group
        className={styles.checkboxGroup}
        value={isDefined(value) && Array.isArray(value) ? value : []}
        {...(onChange ? { onChange } : {})}
        style={checkboxGroupStyle}
        options={options}
      />
    </div>
  );
};

export default MultiCheckbox;
